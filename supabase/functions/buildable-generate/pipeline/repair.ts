// =============================================================================
// REPAIR - Self-repair loop
// =============================================================================

import type { FileOperation, ValidationResult, RepairAttempt, PipelineContext } from "./types.ts";
import { SAFETY_LIMITS } from "./types.ts";
import { validateFiles, canAutoFix, applyAutoFix } from "./validation.ts";
import { callAI } from "./routing.ts";
import { StageTracer } from "./telemetry.ts";

const REPAIR_PROMPT = `You are a code repair AI. Fix the errors and return COMPLETE files.

RULES:
1. Fix ALL reported errors
2. Return COMPLETE files (no placeholders)
3. Balance all braces and parentheses
4. Include all imports

FORMAT:
\`\`\`tsx:src/path/File.tsx
// complete fixed code
\`\`\``;

function extractFiles(response: string): FileOperation[] {
  const files: FileOperation[] = [];
  const regex = /```(\w+)?:([^\n]+)\n([\s\S]*?)```/g;
  let m;
  while ((m = regex.exec(response)) !== null) {
    const path = m[2].trim().replace(/^\/+/, "");
    if (path && m[3] && path.includes("/")) {
      files.push({ path, content: m[3].trim(), operation: "update" });
    }
  }
  return files;
}

function autoFix(files: FileOperation[]): FileOperation[] {
  return files.map(f => {
    if (!f.path.endsWith(".tsx") && !f.path.endsWith(".ts")) return f;
    let c = f.content;

    // Add React imports if missing
    const hooks = ["useState", "useEffect", "useRef"].filter(h => c.includes(h));
    if (hooks.length && !c.includes("from 'react'") && !c.includes('from "react"')) {
      c = `import { ${hooks.join(", ")} } from 'react';\n${c}`;
    }

    // Add lucide imports if missing
    const icons = ["Menu", "X", "ArrowRight", "Sparkles", "Star", "Check", "Zap", "Shield", "Globe"]
      .filter(i => new RegExp(`<${i}[\\s/>]`).test(c));
    if (icons.length && !c.includes("from 'lucide-react'")) {
      c = `import { ${icons.join(", ")} } from 'lucide-react';\n${c}`;
    }

    // Balance braces
    const ob = (c.match(/\{/g) || []).length;
    const cb = (c.match(/\}/g) || []).length;
    if (ob > cb) c = c.trimEnd() + "\n" + "}".repeat(ob - cb) + "\n";

    return { ...f, content: c };
  });
}

export async function runRepairLoop(
  ctx: PipelineContext,
  initial: ValidationResult
): Promise<{ files: FileOperation[]; validation: ValidationResult; repairAttempts: number; success: boolean }> {
  const tracer = new StageTracer(ctx);
  let files = [...ctx.generatedFiles];
  let validation = initial;
  let attempts = 0;

  // Try auto-fix first
  if (!validation.valid) {
    const fixed = autoFix(files);
    const v = validateFiles(fixed);
    if (v.criticalErrors.length < validation.criticalErrors.length) {
      files = fixed;
      validation = v;
    }
  }

  // AI repair loop
  while (!validation.valid && attempts < SAFETY_LIMITS.maxRepairAttempts) {
    attempts++;
    try {
      const errorSummary = validation.criticalErrors.slice(0, 5)
        .map(e => `${e.file}: ${e.message}`).join("\n");
      
      const filesToFix = files.filter(f => 
        validation.criticalErrors.some(e => e.file === f.path)
      ).slice(0, 3);

      const fileContents = filesToFix.map(f => `\`\`\`tsx:${f.path}\n${f.content}\n\`\`\``).join("\n\n");

      const result = await callAI("repair", [
        { role: "system", content: REPAIR_PROMPT },
        { role: "user", content: `ERRORS:\n${errorSummary}\n\nFILES:\n${fileContents}\n\nFix all errors.` },
      ]);

      tracer.modelCall(result.provider, result.model, "repair", result.latencyMs, result.tokensUsed);

      const repaired = extractFiles(result.content);
      for (const r of repaired) {
        const idx = files.findIndex(f => f.path === r.path);
        if (idx >= 0) files[idx] = r;
      }

      validation = validateFiles(files);
      ctx.repairHistory.push({
        attempt: attempts,
        errors: validation.criticalErrors.map(e => ({ type: e.category, file: e.file, message: e.message })),
        patchesApplied: repaired.map(r => r.path),
        resolved: validation.valid,
        duration: result.latencyMs,
      });

    } catch (e) {
      console.error(`[Repair] Attempt ${attempts} failed:`, e);
    }
  }

  return { files, validation, repairAttempts: attempts, success: validation.valid };
}
