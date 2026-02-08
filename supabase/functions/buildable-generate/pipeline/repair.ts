// =============================================================================
// REPAIR - Self-repair loop with completeness handling
// =============================================================================

import type { FileOperation, ValidationResult, RepairAttempt, PipelineContext, ArchitecturePlan } from "./types.ts";
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

const COMPLETION_PROMPT = `You are a code generation AI. Generate the MISSING files for an existing project.

RULES:
1. Generate COMPLETE, production-ready code for each missing file
2. Match the visual style and design patterns of the existing files
3. Use the same color scheme, spacing, and animation patterns
4. Include all necessary imports
5. Every component must have real content (no placeholders)
6. Use generous spacing (py-20 to py-32 for sections)
7. Include hover effects and transitions on all interactive elements

FORMAT:
\`\`\`tsx:src/path/Component.tsx
// complete code here
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

// =============================================================================
// COMPLETION PASS - Generate missing files
// =============================================================================

async function generateMissingFiles(
  ctx: PipelineContext,
  missingPaths: string[],
  tracer: StageTracer
): Promise<FileOperation[]> {
  if (missingPaths.length === 0) return [];

  console.log(`[Repair] Generating ${missingPaths.length} missing files: ${missingPaths.join(", ")}`);

  // Build context from existing generated files
  const existingContext = ctx.generatedFiles
    .slice(0, 5)
    .map(f => `${f.path}:\n\`\`\`tsx\n${f.content.slice(0, 1000)}\n\`\`\``)
    .join("\n\n");

  // Build missing file descriptions from plan
  const missingDescriptions = missingPaths.map(path => {
    const planned = ctx.plan?.components.find(c => c.path === path) || ctx.plan?.pages.find(p => p.path === path);
    const purpose = planned?.purpose || "Component";
    const features = planned?.features?.join(", ") || "standard features";
    return `- ${path}: ${purpose} (features: ${features})`;
  }).join("\n");

  try {
    const result = await callAI("coding", [
      { role: "system", content: COMPLETION_PROMPT },
      { role: "user", content: `PROJECT: "${ctx.originalPrompt}"

EXISTING FILES (for style reference):
${existingContext}

MISSING FILES TO GENERATE:
${missingDescriptions}

Generate EACH missing file with COMPLETE code matching the existing style. Use the same design patterns, colors, and animations.` },
    ]);

    tracer.modelCall(result.provider, result.model, "repair", result.latencyMs, result.tokensUsed);

    const generated = extractFiles(result.content);
    console.log(`[Repair] Generated ${generated.length}/${missingPaths.length} missing files`);
    return generated.map(f => ({ ...f, operation: "create" as const }));
  } catch (e) {
    console.error("[Repair] Completion pass failed:", e);
    return [];
  }
}

// =============================================================================
// MAIN REPAIR LOOP
// =============================================================================

export async function runRepairLoop(
  ctx: PipelineContext,
  initial: ValidationResult
): Promise<{ files: FileOperation[]; validation: ValidationResult; repairAttempts: number; success: boolean }> {
  const tracer = new StageTracer(ctx);
  let files = [...ctx.generatedFiles];
  let validation = initial;
  let attempts = 0;

  // =========================================================================
  // STEP 1: Completion pass — generate missing files before fixing syntax
  // =========================================================================
  if (validation.missingFiles && validation.missingFiles.length > 0 && ctx.plan) {
    const completenessRatio = validation.completenessScore ?? 1;
    
    if (completenessRatio < 0.8) {
      // Too many files missing — do a completion pass
      const newFiles = await generateMissingFiles(ctx, validation.missingFiles, tracer);
      if (newFiles.length > 0) {
        files = [...files, ...newFiles];
        validation = validateFiles(files, ctx.plan);
        console.log(`[Repair] After completion pass: ${files.length} files, completeness: ${(validation.completenessScore ?? 0).toFixed(2)}`);
      }
    }
  }

  // =========================================================================
  // STEP 2: Auto-fix pass
  // =========================================================================
  if (!validation.valid) {
    const fixed = autoFix(files);
    const v = validateFiles(fixed, ctx.plan);
    if (v.criticalErrors.length < validation.criticalErrors.length) {
      files = fixed;
      validation = v;
    }
  }

  // =========================================================================
  // STEP 3: AI repair loop for remaining errors
  // =========================================================================
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

      validation = validateFiles(files, ctx.plan);
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
