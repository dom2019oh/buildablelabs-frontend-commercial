

# Sync Engine Implementation Plan

## Problem Summary

The current architecture has a fundamental gap between the AI's text output and the application's internal state management. Today, the backend runs a blocking 8-stage pipeline that returns a single JSON payload when *everything* is done. The frontend then relies on Supabase Realtime events to see files appear, but there is no structured command protocol, no incremental file delivery, and no diffing engine. The result: the user stares at a loading state for the entire pipeline duration with no progressive feedback, and the system replaces entire files even for 1-line changes.

This plan implements the 6 core improvements from the Gemini analysis, adapted to the existing Buildable architecture.

---

## Phase 1: Command Protocol (Structured "File Packets")

**What changes:** Instead of the AI returning freeform markdown with code blocks, the pipeline will wrap every file change in a structured JSON command.

**Backend (`buildable-generate/pipeline/`):**
- Define a `FileCommand` type in `types.ts`:
  ```
  type CommandType = "CREATE_FILE" | "UPDATE_FILE" | "DELETE_FILE" | "PATCH_FILE"
  
  interface FileCommand {
    command: CommandType
    path: string
    content?: string        // full content for CREATE/UPDATE
    patches?: SearchReplacePatch[]  // for PATCH_FILE
    metadata?: { language, purpose }
  }
  ```
- Update `stages/generate.ts` to emit `FileCommand[]` instead of raw `FileOperation[]`
- Update the pipeline result type to include `commands: FileCommand[]`

**Frontend (`stores/projectFilesStore.ts`):**
- Add a `applyCommand(cmd: FileCommand)` action to the Zustand store that switches on `cmd.command` to route to `addFile`, `updateFile`, `removeFile`, or the new `patchFile`

---

## Phase 2: Streaming File Delivery (SSE Pipeline)

**What changes:** Convert the `buildable-generate` edge function from a blocking JSON response to an SSE stream that emits structured events as each pipeline stage completes.

**Backend (`buildable-generate/index.ts`):**
- Change the response to `Content-Type: text/event-stream`
- Emit events progressively:
  ```
  data: {"type":"stage","stage":"intent","status":"complete"}
  data: {"type":"stage","stage":"plan","status":"complete","data":{...}}
  data: {"type":"file","command":"CREATE_FILE","path":"src/components/Hero.tsx","content":"..."}
  data: {"type":"file","command":"CREATE_FILE","path":"src/components/Navbar.tsx","content":"..."}
  data: {"type":"stage","stage":"validate","status":"complete","score":0.95}
  data: {"type":"complete","filesGenerated":7,"aiMessage":"..."}
  ```
- Each file is emitted and saved to the database *as it's parsed* from the AI response, not after the entire pipeline finishes

**Frontend (`hooks/useBuildableAI.ts`):**
- The existing SSE parsing code (lines 279-370) is already written but currently unused because the backend returns JSON. This plan activates it.
- Modify the SSE handler to recognize `type: "file"` events and immediately call `applyCommand()` on the Zustand store
- Modify the SSE handler to recognize `type: "stage"` events and update the `phase` state with real progress (e.g., "Planning...", "Generating files...", "Validating...")
- Remove the JSON fallback path once streaming is stable

---

## Phase 3: Recursive Tree Resolver

**What changes:** Harden the file tree builder to safely handle deeply nested paths and auto-create missing intermediate folders.

**Frontend (`components/workspace/FileExplorer.tsx`):**
- The existing `buildFileTree()` function already walks paths and creates folder nodes. This phase adds:
  - Deduplication guard (prevent double-insertion of same path)
  - Sorting stability (folders first, then alphabetical)
  - A `resolveOrCreatePath(tree, segments)` helper that the store can call directly to ensure parent folders exist before placing a file

**Frontend (`stores/projectFilesStore.ts`):**
- When `addFile` or `applyCommand` is called, run the path through the resolver before inserting

---

## Phase 4: Search-and-Replace Diffing Engine

**What changes:** For modifications to existing files, instead of sending the entire file back, the AI can emit "patches" that surgically replace specific sections.

**New types in `types.ts`:**
```
interface SearchReplacePatch {
  search: string    // exact text to find
  replace: string   // replacement text
  context?: string  // optional surrounding context for disambiguation
}
```

**Backend (`pipeline/core-directive.ts`):**
- Add a new instruction block to the system prompt for modification requests:
  ```
  When MODIFYING existing files, use PATCH format:
  [PATCH:src/components/Hero.tsx]
  <<<< SEARCH
  <h1 className="text-4xl">Old Title</h1>
  ====
  <h1 className="text-4xl">New Title</h1>
  >>>> REPLACE
  ```
- Only used for `modify` intent types; new projects still use full file creation

**Backend (`stages/generate.ts`):**
- Add a `extractPatches()` parser alongside the existing `extractFiles()` function
- When patches are found, emit `PATCH_FILE` commands instead of `UPDATE_FILE`

**Frontend (`stores/projectFilesStore.ts`):**
- Add a `patchFile(path, patches)` action that:
  1. Gets the current file content from the Map
  2. Applies each search/replace patch sequentially
  3. Updates the file in the store
  4. Rebuilds the preview

---

## Phase 5: Single Source of Truth

**What changes:** Eliminate the dual-source conflict between "streaming text content" and "database files." The Zustand file store becomes the *only* truth.

**Frontend (`hooks/useBuildableAI.ts`):**
- Stop maintaining a separate `generatedFiles` array in the hook state
- Instead, as SSE file events arrive, apply them directly to the Zustand store
- The hook's role becomes: manage the stream connection, parse events, and dispatch commands to the store

**Frontend (`components/workspace/ProjectWorkspaceV3.tsx`):**
- Remove the `useEffect` that syncs `generatedFiles` from the AI hook into the store (lines 231-249) - this becomes unnecessary since files go directly into the store via commands
- The workspace reads *only* from the Zustand store for its file tree, editor, and preview
- On page load, hydrate the store from `workspace_files` in the database (already done via `useWorkspace`)

**Context injection for AI:**
- Before each generation request, automatically build a "File Tree Summary" from the Zustand store's current state and inject it into the conversation history as a system message
- This ensures the AI always works with the latest code state, not what was discussed 10 messages ago

---

## Phase 6: Persistence Bridge (Database Sync)

**What changes:** Ensure the Zustand store and Supabase `workspace_files` table stay in lockstep.

**Current flow (no change needed for writes):** The backend already writes to `workspace_files` via `saveFilesToDatabase()`. Supabase Realtime already notifies the frontend.

**Improvement: Optimistic updates:**
- When a file command arrives via SSE, apply it to the Zustand store *immediately* (optimistic)
- The Realtime subscription from `useWorkspace` will confirm the database write shortly after
- If the Realtime event shows a different version, reconcile by preferring the database version

**Improvement: Manual edit persistence:**
- When the user manually edits a file in the Code editor and saves, write the change back to `workspace_files` via a direct Supabase upsert
- This is partially implemented in `handleFileSave` but currently only updates the local store

---

## Technical Details

### Files to Create
1. `src/lib/syncEngine.ts` - Core sync engine: command types, `applyCommand()`, `applyPatch()`, file tree resolver, context summary builder

### Files to Modify
1. `supabase/functions/buildable-generate/pipeline/types.ts` - Add `FileCommand`, `SearchReplacePatch` types
2. `supabase/functions/buildable-generate/index.ts` - Convert to SSE streaming response
3. `supabase/functions/buildable-generate/pipeline/index.ts` - Emit file commands progressively via callback
4. `supabase/functions/buildable-generate/pipeline/stages/generate.ts` - Add patch extraction for modifications
5. `supabase/functions/buildable-generate/pipeline/core-directive.ts` - Add PATCH format instructions to system prompt
6. `src/stores/projectFilesStore.ts` - Add `applyCommand()`, `patchFile()`, improve tree resolver
7. `src/hooks/useBuildableAI.ts` - Activate SSE path, dispatch commands directly to store
8. `src/components/workspace/ProjectWorkspaceV3.tsx` - Remove redundant sync effects, read only from store

### Migration Strategy
- Phase 1-2 can be implemented together (command protocol + streaming)
- Phase 3 is a standalone hardening improvement
- Phase 4 (diffing) can be added incrementally after the core streaming works
- Phase 5-6 are cleanup/optimization after the streaming pipeline is live
- The JSON fallback path in `useBuildableAI.ts` should be kept temporarily during rollout, controlled by a feature flag or content-type check (which already exists)

### Risk Mitigations
- Keep the existing JSON response path as fallback if SSE stream fails
- Patches that fail to match (search string not found) fall back to full file replacement
- The Zustand store's `applyCommand` validates paths before writing (reuses existing `isPathWriteable` logic)
- Maximum patch size limit prevents memory issues
