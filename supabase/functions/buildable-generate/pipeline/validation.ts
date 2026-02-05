// =============================================================================
// VALIDATION - Code Quality Checks
// =============================================================================

import type { FileOperation, ValidationResult, ValidationError, ErrorCategory } from "./types.ts";

export function validateFiles(files: FileOperation[]): ValidationResult {
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

    // Import check for React hooks
    if ((c.includes("useState") || c.includes("useEffect")) && !c.includes("from 'react'") && !c.includes('from "react"')) {
      errors.push({ category: "IMPORT", file: file.path, message: "Missing React import", fix: "Add React import", severity: "error", autoFixable: true });
    }
  }

  // Polish checks
  const allContent = files.map(f => f.content).join("\n");
  if (allContent.includes("unsplash.com")) polishScore += 15;
  if (allContent.includes("bg-gradient-to")) polishScore += 10;
  if (allContent.includes("hover:")) polishScore += 10;
  if (allContent.includes("backdrop-blur")) polishScore += 5;
  if (files.length >= 8) polishScore += 10;

  // Warnings
  if (!allContent.includes("unsplash.com")) {
    warnings.push({ category: "STRUCTURE", file: "", message: "No Unsplash images", fix: "Add real images", severity: "warning", autoFixable: false });
  }
  if (files.length < 6) {
    warnings.push({ category: "STRUCTURE", file: "", message: "Few files generated", fix: "Add more components", severity: "warning", autoFixable: false });
  }

  return {
    valid: errors.length === 0,
    score: Math.min(100, polishScore),
    criticalErrors: errors,
    warnings,
    suggestions: warnings.map(w => w.fix),
  };
}

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
