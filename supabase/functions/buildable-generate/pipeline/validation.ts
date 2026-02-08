// =============================================================================
// VALIDATION - Code Quality + Completeness Checks
// =============================================================================

import type { FileOperation, ValidationResult, ValidationError, ErrorCategory, ArchitecturePlan } from "./types.ts";

// =============================================================================
// MAIN VALIDATION
// =============================================================================

export function validateFiles(files: FileOperation[], plan?: ArchitecturePlan): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  let polishScore = 50;

  for (const file of files) {
    if (!file.path.endsWith(".tsx") && !file.path.endsWith(".ts")) continue;
    const c = file.content;

    // Syntax checks
    const opens = (c.match(/\{/g) || []).length;
    const closes = (c.match(/\}/g) || []).length;
    if (opens !== closes) {
      errors.push({ category: "SYNTAX", file: file.path, message: "Unbalanced braces", fix: "Balance { and }", severity: "error", autoFixable: false });
    }

    const parens = (c.match(/\(/g) || []).length - (c.match(/\)/g) || []).length;
    if (parens !== 0) {
      errors.push({ category: "SYNTAX", file: file.path, message: "Unbalanced parentheses", fix: "Balance ( and )", severity: "error", autoFixable: false });
    }

    // Incomplete ternary
    if (/\?\s*:/g.test(c)) {
      errors.push({ category: "SYNTAX", file: file.path, message: "Incomplete ternary", fix: "Add both branches", severity: "error", autoFixable: false });
    }

    // Placeholder detection
    if (/\/\/\s*\.\.\./.test(c) || /\/\/\s*TODO/i.test(c)) {
      errors.push({ category: "STRUCTURE", file: file.path, message: "Contains placeholder", fix: "Complete the code", severity: "error", autoFixable: false });
    }

    // Empty component check (returns null or has no JSX)
    if (file.path.endsWith(".tsx")) {
      const hasJSX = /<\w/.test(c);
      const isReturnNull = /return\s+null\s*;/.test(c) && !hasJSX;
      if (isReturnNull) {
        errors.push({ category: "STRUCTURE", file: file.path, message: "Empty component (returns null)", fix: "Add actual JSX content", severity: "error", autoFixable: false });
      }
      if (!hasJSX && c.includes("export default")) {
        warnings.push({ category: "STRUCTURE", file: file.path, message: "Component has no JSX", fix: "Add rendered content", severity: "warning", autoFixable: false });
      }
    }

    // Import check for React hooks
    if ((c.includes("useState") || c.includes("useEffect")) && !c.includes("from 'react'") && !c.includes('from "react"')) {
      errors.push({ category: "IMPORT", file: file.path, message: "Missing React import", fix: "Add React import", severity: "error", autoFixable: true });
    }
  }

  // ==========================================================================
  // POLISH SCORING (enhanced)
  // ==========================================================================
  const allContent = files.map(f => f.content).join("\n");

  // Visual quality
  if (allContent.includes("unsplash.com")) polishScore += 10;
  if (allContent.includes("bg-gradient-to")) polishScore += 8;
  if (allContent.includes("hover:")) polishScore += 8;
  if (allContent.includes("backdrop-blur")) polishScore += 5;
  if (allContent.includes("transition-")) polishScore += 5;

  // Typography & spacing
  if (/text-[5-7]xl/.test(allContent)) polishScore += 5; // Large hero text
  if (/py-2[0-9]|py-3[0-9]/.test(allContent)) polishScore += 5; // Generous spacing
  if (allContent.includes("tracking-")) polishScore += 3; // Letter spacing
  if (allContent.includes("leading-")) polishScore += 3; // Line height

  // Animations
  if (allContent.includes("animate-") || allContent.includes("@keyframes")) polishScore += 5;
  if (allContent.includes("group-hover:")) polishScore += 3;
  if (allContent.includes("hover:-translate-y")) polishScore += 3;

  // Content quality
  if (files.length >= 8) polishScore += 5;
  if (files.length >= 10) polishScore += 5;

  // Warnings
  if (!allContent.includes("unsplash.com")) {
    warnings.push({ category: "STRUCTURE", file: "", message: "No Unsplash images", fix: "Add real images", severity: "warning", autoFixable: false });
  }
  if (files.length < 6) {
    warnings.push({ category: "STRUCTURE", file: "", message: "Few files generated", fix: "Add more components", severity: "warning", autoFixable: false });
  }
  if (!allContent.includes("transition-")) {
    warnings.push({ category: "STRUCTURE", file: "", message: "No transitions/animations", fix: "Add hover transitions", severity: "warning", autoFixable: false });
  }

  // ==========================================================================
  // COMPLETENESS CHECK (compare against plan)
  // ==========================================================================
  let completenessScore = 1.0;
  const missingFiles: string[] = [];

  if (plan) {
    const allPlannedPaths = [
      ...plan.pages.map(p => p.path),
      ...plan.components.map(c => c.path),
    ];

    const generatedPaths = new Set(files.map(f => f.path));

    for (const planned of allPlannedPaths) {
      if (!generatedPaths.has(planned)) {
        missingFiles.push(planned);
      }
    }

    if (allPlannedPaths.length > 0) {
      completenessScore = (allPlannedPaths.length - missingFiles.length) / allPlannedPaths.length;
    }

    if (missingFiles.length > 0) {
      warnings.push({
        category: "STRUCTURE",
        file: "",
        message: `Missing ${missingFiles.length} planned files: ${missingFiles.slice(0, 3).join(", ")}${missingFiles.length > 3 ? "..." : ""}`,
        fix: "Generate missing files",
        severity: "warning",
        autoFixable: false,
      });
    }
  }

  return {
    valid: errors.length === 0,
    score: Math.min(100, polishScore),
    completenessScore,
    criticalErrors: errors,
    warnings,
    suggestions: warnings.map(w => w.fix),
    missingFiles: missingFiles.length > 0 ? missingFiles : undefined,
  };
}

// =============================================================================
// AUTO-FIX HELPERS
// =============================================================================

export function canAutoFix(cat: ErrorCategory): boolean {
  return cat === "IMPORT";
}

export function applyAutoFix(err: ValidationError, content: string): string | null {
  if (err.category === "IMPORT" && err.message.includes("React")) {
    if (!content.startsWith("import")) {
      return `import { useState, useEffect } from 'react';\n${content}`;
    }
    return content.replace(/^(import.*)$/m, `import { useState, useEffect } from 'react';\n$1`);
  }
  return null;
}
