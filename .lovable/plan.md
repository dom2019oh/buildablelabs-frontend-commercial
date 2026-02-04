
# Buildable AI Internal Agent Upgrade

## Executive Summary

This plan upgrades the internal AI system that powers the Buildable chat interface, transforming it from a basic multi-stage pipeline into a **deterministic, self-correcting autonomous engineering agent** with robust execution, observability, and safety mechanisms.

**Scope**: Platform-internal work only - no UI features or external integrations.

---

## Current Architecture Analysis

### Existing Components

| Layer | Implementation | Location |
|-------|---------------|----------|
| **Frontend Hook** | `useBuildableAI` | `src/hooks/useBuildableAI.ts` |
| **Workspace Manager** | `useWorkspace` | `src/hooks/useWorkspace.ts` |
| **Edge Function (Main)** | `buildable-generate` | `supabase/functions/buildable-generate/` |
| **Edge Function (Alt)** | `workspace-api` | `supabase/functions/workspace-api/` |
| **Backend Docs** | Railway backend spec | `docs/backend-repo/src/services/ai/` |
| **Preview System** | WebContainer + Static HTML | `src/lib/webcontainer.ts`, `projectFilesStore.ts` |
| **Database** | Supabase tables | `workspaces`, `workspace_files`, `generation_sessions`, `file_operations` |

### Current Pipeline Stages
```text
1. Intent Analysis (implicit)
2. Architect (Gemini) → Plan creation
3. Coder (Grok) → File generation
4. Validator (Local + OpenAI) → Syntax checks
5. Repair (OpenAI) → Error fixing
6. Persona → Friendly response
```

### Identified Gaps
- No explicit intent extraction stage
- No task decomposition before planning
- Validation is reactive, not proactive
- No structured log capture during execution
- No rollback mechanism
- Limited error classification
- Preview only supports static HTML compilation (WebContainer optional)
- No retry caps or execution timeouts
- No telemetry/diagnostics infrastructure

---

## Implementation Plan

### Phase 1: Deterministic Agent Pipeline Core

**Goal**: Restructure the generation pipeline into explicit, logged, inspectable stages.

#### 1.1 Pipeline Stage Interface

Create a new type-safe pipeline orchestrator in the edge function:

```text
supabase/functions/buildable-generate/pipeline/
  ├── index.ts           # Pipeline orchestrator
  ├── stages/
  │   ├── intent.ts      # Stage 1: Intent extraction
  │   ├── decompose.ts   # Stage 2: Task decomposition
  │   ├── plan.ts        # Stage 3: Architecture planning
  │   ├── generate.ts    # Stage 4: Code generation
  │   ├── validate.ts    # Stage 5: Validation + normalization
  │   ├── execute.ts     # Stage 6: Preview execution
  │   ├── interpret.ts   # Stage 7: Log interpretation
  │   └── repair.ts      # Stage 8: Targeted repair
  ├── types.ts           # Shared types
  └── telemetry.ts       # Stage logging
```

#### 1.2 Stage Execution Contract

Each stage implements:

```text
interface PipelineStage<TInput, TOutput> {
  name: string;
  execute(input: TInput, context: PipelineContext): Promise<StageResult<TOutput>>;
  canRetry: boolean;
  maxRetries: number;
  timeout: number;
  rollback?(context: PipelineContext): Promise<void>;
}
```

#### 1.3 Pipeline Context Object

Persistent context passed between stages:

- `sessionId`, `workspaceId`, `userId`
- `originalPrompt`, `intent`, `taskList`
- `plan`, `generatedFiles`, `validationResults`
- `executionLogs`, `repairHistory`
- `rollbackPoints`, `telemetry`

---

### Phase 2: Internal Project Context System

**Goal**: Build and persist comprehensive project context before any generation.

#### 2.1 Context Builder Module

```text
supabase/functions/buildable-generate/context/
  ├── builder.ts         # Context construction
  ├── scanner.ts         # File tree scanner
  ├── parser.ts          # Config/dependency parser
  ├── detector.ts        # Framework/pattern detection
  └── memory.ts          # Context persistence
```

#### 2.2 Context Extraction Actions

| Action | Output |
|--------|--------|
| **Load Workspace** | Active files from `workspace_files` table |
| **Scan File Tree** | Directory structure, file types, sizes |
| **Parse Configs** | `package.json`, `tsconfig.json`, `tailwind.config` |
| **Parse Dependencies** | Installed packages, versions |
| **Detect Frameworks** | React/Vue/Next, Tailwind, shadcn/ui |
| **Detect Patterns** | Component structure, hook patterns, styling conventions |
| **Build Context Memory** | Compressed summary for LLM context window |

#### 2.3 Persisted Context Schema

Add metadata column usage in `generation_sessions`:

```text
metadata: {
  context: {
    framework: "react",
    styling: "tailwind",
    componentCount: 12,
    pageCount: 3,
    patterns: ["hooks", "shadcn", "react-router"],
    dependencies: ["lucide-react", "framer-motion"],
    lastModified: {}
  }
}
```

---

### Phase 3: Incremental Editing Engine

**Goal**: Implement diff-based editing that modifies only necessary sections.

#### 3.1 Diff Engine Module

```text
supabase/functions/buildable-generate/editor/
  ├── analyzer.ts        # Change requirement analysis
  ├── differ.ts          # Diff generation
  ├── applier.ts         # Patch application
  ├── validator.ts       # Pre-save syntax validation
  └── safety.ts          # Unsafe change rejection
```

#### 3.2 Edit Operation Types

| Operation | Description |
|-----------|-------------|
| **INSERT_SECTION** | Add new code block (import, component, function) |
| **REPLACE_SECTION** | Replace specific lines/functions |
| **MODIFY_PROPS** | Update component props only |
| **ADD_IMPORT** | Add import statement |
| **REMOVE_SECTION** | Delete code block |

#### 3.3 Safety Guards

Before applying any edit:
- Verify AST parsability (TypeScript/Babel parser in Deno)
- Check import validity against workspace
- Prevent modifications to protected paths
- Calculate and log diff size
- Reject edits that exceed 80% file change (suggest full rewrite)

---

### Phase 4: Execution & Preview Infrastructure

**Goal**: Enhance preview system with health monitoring and fallback handling.

#### 4.1 Preview Manager Enhancement

Update `src/lib/webcontainer.ts` and create unified preview orchestrator:

```text
src/lib/preview/
  ├── manager.ts         # Preview lifecycle management
  ├── webcontainer.ts    # WebContainer adapter
  ├── static.ts          # Static HTML compilation
  ├── health.ts          # Health monitoring
  └── cleanup.ts         # Session cleanup
```

#### 4.2 Preview States

```text
type PreviewState = 
  | 'idle'
  | 'provisioning'
  | 'installing'
  | 'starting'
  | 'running'
  | 'error'
  | 'recovering'
  | 'terminated';
```

#### 4.3 Execution Workflow

1. **Provisioning**: Boot WebContainer or prepare static compiler
2. **Installation**: Install dependencies (cached when possible)
3. **Launch**: Start Vite dev server
4. **Port Mapping**: Capture `server-ready` event URL
5. **Health Check**: Periodic ping to preview URL
6. **Recovery**: Auto-restart on 3 consecutive health failures
7. **Cleanup**: Terminate container on session end or timeout

#### 4.4 Fallback Strategy

```text
WebContainer Unavailable?
  └─> Use Static HTML Compilation
        └─> compileWorkspaceEntryToHtml()
              └─> Component inlining
                    └─> generatePreviewHtml()
```

---

### Phase 5: Error-Aware Self-Repair Loop

**Goal**: Implement structured error capture, classification, and targeted repair.

#### 5.1 Error Capture Module

```text
supabase/functions/buildable-generate/repair/
  ├── capture.ts         # Log capture from preview/build
  ├── normalize.ts       # Error normalization
  ├── classify.ts        # Error classification
  ├── root-cause.ts      # Root cause analysis
  ├── patch.ts           # Focused patch generation
  └── history.ts         # Failure history tracking
```

#### 5.2 Error Classification Taxonomy

| Category | Examples | Repair Strategy |
|----------|----------|-----------------|
| **SYNTAX** | Missing brace, unclosed tag | Local validator fix |
| **IMPORT** | Missing import, wrong path | Import resolver |
| **TYPE** | TypeScript error | Type inference fix |
| **RUNTIME** | Undefined variable, null access | Defensive code injection |
| **REACT** | Hook rules violation | Hook reorganization |
| **DEPENDENCY** | Missing package | Dependency suggestion |

#### 5.3 Repair Loop Logic

```text
MAX_REPAIR_ATTEMPTS = 3

for attempt in 1..MAX_REPAIR_ATTEMPTS:
  validation = validateCodeLocally(files)
  
  if validation.valid:
    break
  
  errors = classifyErrors(validation.errors)
  patches = generateTargetedPatches(errors, files)
  files = applyPatches(files, patches)
  
  recordRepairAttempt(attempt, errors, patches)

if not validation.valid:
  triggerRollback()
  notifyUser("Generation failed after 3 repair attempts")
```

#### 5.4 Failure History Schema

Track in `generation_sessions.metadata`:

```text
repairHistory: [
  {
    attempt: 1,
    errors: [{type: "SYNTAX", file: "...", message: "..."}],
    patchesApplied: ["..."],
    resolved: false
  }
]
```

---

### Phase 6: Multi-Model Coordination Layer

**Goal**: Improve orchestration with confidence scoring and intelligent fallbacks.

#### 6.1 Enhanced Task Routing

```text
supabase/functions/buildable-generate/routing/
  ├── router.ts          # Task-to-model routing
  ├── confidence.ts      # Response confidence scoring
  ├── fallback.ts        # Fallback chain execution
  └── models.ts          # Model configurations
```

#### 6.2 Model Assignment Matrix

| Task | Primary | Confidence Threshold | Fallback |
|------|---------|---------------------|----------|
| **Intent Extraction** | Gemini Flash | 0.85 | GPT-4o-mini |
| **Task Decomposition** | Gemini Pro | 0.80 | GPT-4o |
| **Architecture** | Gemini Pro | 0.85 | GPT-4o |
| **Code Generation** | Grok-2 | 0.75 | GPT-4o |
| **Validation** | Local | N/A | Grok-2 |
| **Repair** | GPT-4o | 0.80 | Grok-2 |
| **Root Cause Analysis** | GPT-4o | 0.85 | Gemini Pro |

#### 6.3 Confidence Scoring

After each model call, evaluate response quality:

```text
function scoreConfidence(response, task):
  - Check for required output fields
  - Validate JSON structure if expected
  - Check code syntax if code task
  - Measure response completeness
  - Return 0.0 - 1.0 score
```

If confidence < threshold, invoke fallback model.

---

### Phase 7: Stability, Safety, and Limits

**Goal**: Add safeguards to prevent runaway loops and resource exhaustion.

#### 7.1 Safety Configuration

```text
const SAFETY_LIMITS = {
  maxRetries: 3,
  maxRepairAttempts: 3,
  generationTimeout: 120_000,    // 2 minutes
  stageTimeout: 30_000,          // 30 seconds per stage
  maxFilesPerGeneration: 20,
  maxFileSizeBytes: 100_000,     // 100KB per file
  maxTotalContentBytes: 500_000, // 500KB total
  previewHealthCheckInterval: 10_000,
  previewMaxRecoveryAttempts: 3,
  sessionIdleTimeout: 300_000,   // 5 minutes
};
```

#### 7.2 Circuit Breaker Pattern

```text
if (consecutiveFailures >= 3) {
  circuitState = 'open';
  cooldownUntil = now + 60_000;
  return { error: 'System temporarily unavailable' };
}

if (circuitState === 'open' && now > cooldownUntil) {
  circuitState = 'half-open';
  // Allow one request through
}
```

#### 7.3 Session Isolation

Each generation session operates in isolation:
- Separate context object
- Independent telemetry stream
- Isolated rollback history
- Scoped to single workspace

#### 7.4 Crash Recovery

On unexpected error:
1. Log full error with stack trace
2. Record partial state to `generation_sessions`
3. Rollback any uncommitted file operations
4. Set workspace status to 'error'
5. Return user-friendly error message

---

### Phase 8: Internal Telemetry & Diagnostics

**Goal**: Add comprehensive observability for engineering debugging.

#### 8.1 Telemetry Module

```text
supabase/functions/buildable-generate/telemetry/
  ├── collector.ts       # Metrics collection
  ├── logger.ts          # Structured logging
  ├── tracer.ts          # Stage tracing
  └── exporter.ts        # Data export
```

#### 8.2 Telemetry Events

| Event | Data |
|-------|------|
| `stage.start` | `{stage, sessionId, timestamp}` |
| `stage.complete` | `{stage, duration, success, tokensUsed}` |
| `stage.error` | `{stage, error, context}` |
| `model.call` | `{provider, model, tokens, latency}` |
| `validation.result` | `{valid, errorCount, warningCount, score}` |
| `repair.attempt` | `{attempt, errorsFixed, errorsRemaining}` |
| `preview.status` | `{status, uptime, restarts}` |
| `session.complete` | `{duration, filesGenerated, success}` |

#### 8.3 Diagnostics Storage

Store in `generation_sessions.metadata.telemetry`:

```text
{
  stages: [
    { name: "intent", startMs: 0, endMs: 245, success: true },
    { name: "decompose", startMs: 246, endMs: 412, success: true },
    ...
  ],
  modelCalls: [
    { provider: "gemini", model: "gemini-2.5-pro", tokens: 1247, latencyMs: 1832 }
  ],
  repairAttempts: 1,
  totalDuration: 8432,
  totalTokens: 4521,
  totalCost: 0.0023
}
```

---

### Phase 9: File Generation Governance

**Goal**: Implement strict rules for file classification, validation, and lifecycle.

#### 9.1 File Classification System

```text
type FileClassification = 
  | 'internal'    // Platform code (never modify)
  | 'system'      // Config files (careful modification)
  | 'generated'   // AI-created files
  | 'runtime'     // Temporary/preview files
  | 'user'        // User-edited files
```

#### 9.2 Classification Rules

| Path Pattern | Classification | AI Writeable |
|--------------|----------------|--------------|
| `src/integrations/**` | internal | No |
| `src/main.tsx` | system | No |
| `package.json` | system | Read-only |
| `src/pages/**` | generated | Yes |
| `src/components/**` | generated | Yes |
| `src/hooks/**` | generated | Yes |
| `.cache/**`, `node_modules/**` | runtime | No |

#### 9.3 File Validation Before Write

```text
function validateFileWrite(path, content):
  1. Check path against classification rules
  2. Validate path format (no ../, no absolute)
  3. Check for naming conflicts
  4. Validate file extension matches content
  5. Parse content for syntax validity
  6. Check dependencies exist in workspace
  7. Return { valid: boolean, errors: string[] }
```

#### 9.4 Lifecycle Tracking

Extend `workspace_files` metadata:

```text
metadata: {
  classification: "generated",
  createdBy: "session-uuid",
  createdAt: "2025-02-04T...",
  modifyingAgent: "repair-stage",
  regenerationCount: 2,
  rollbackPoints: ["v1-content-hash", "v2-content-hash"]
}
```

#### 9.5 Selective Restore

Support restoring individual files to previous versions:

```text
async function restoreFile(workspaceId, filePath, rollbackPointHash):
  1. Find rollback point in file_operations history
  2. Retrieve content from that point
  3. Validate content still parseable
  4. Apply restore as new operation
  5. Trigger preview refresh
```

---

## Technical Specifications

### File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/buildable-generate/index.ts` | Major refactor | Integrate new pipeline orchestrator |
| `supabase/functions/buildable-generate/pipeline/*` | New | 8-stage pipeline implementation |
| `supabase/functions/buildable-generate/context/*` | New | Context builder system |
| `supabase/functions/buildable-generate/editor/*` | New | Diff-based editing engine |
| `supabase/functions/buildable-generate/repair/*` | New | Error classification + repair loop |
| `supabase/functions/buildable-generate/routing/*` | New | Enhanced model routing |
| `supabase/functions/buildable-generate/telemetry/*` | New | Observability infrastructure |
| `src/lib/preview/manager.ts` | New | Unified preview orchestrator |
| `src/lib/preview/health.ts` | New | Health monitoring |
| `docs/backend-repo/src/services/ai/pipeline.ts` | Update | Sync with edge function changes |
| `docs/backend-repo/src/services/ai/validator.ts` | Update | Enhanced classification |

### Database Migrations

No schema changes required - existing `metadata` JSONB columns will store new data.

### Dependencies

No new npm packages required. All code uses Deno standard library and existing Supabase SDK.

---

## Implementation Order

1. **Telemetry foundation** - Add structured logging first for visibility
2. **Pipeline orchestrator** - Create stage interface and orchestrator
3. **Context builder** - Implement project context extraction
4. **Enhanced validation** - Upgrade error classification
5. **Repair loop** - Implement targeted repair with history
6. **Model routing** - Add confidence scoring and fallbacks
7. **Diff editor** - Implement incremental editing
8. **Preview health** - Add monitoring and recovery
9. **Safety limits** - Implement circuit breaker and timeouts
10. **File governance** - Classification and lifecycle tracking

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Generation success rate | ~70% | >90% |
| Average repair attempts needed | Unknown | <1.5 |
| Files with syntax errors shipped | ~10% | <1% |
| Pipeline observability | None | Full stage tracing |
| Recovery from preview failures | Manual | Automatic |
| Rollback capability | None | Per-file restore |
