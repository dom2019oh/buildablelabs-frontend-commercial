

# Fix Message Persistence, Upgrade AI Design Quality, and Add Home Button

## Overview

Three issues to address:
1. **Messages don't persist properly** -- only the "Created 0 file(s):" message survives refresh because the realtime subscription only listens for INSERT events, not UPDATE events. When the placeholder message gets updated with the final result, the UI never sees the change.
2. **AI design quality needs to be world-class** -- upgrade the core directive and model routing to produce commercial-grade CSS, animations, and UI designs.
3. **No Home button in the dashboard** -- users in the workspace/project editor have no way to navigate back to the main site homepage.

---

## Part 1: Fix Message Persistence (Critical Bug)

**Root Cause**: The `useProjectMessages` hook subscribes to realtime `INSERT` events only (line 59). When `handleSendMessage` creates a placeholder message and then **updates** it with the final result, the UI never reflects the update because there's no `UPDATE` listener. On refresh, the query re-fetches from the database and shows the original placeholder content ("Generating...") or the updated content, depending on timing.

**Fix 1: `src/hooks/useProjectMessages.ts`**
- Change the realtime subscription from `event: 'INSERT'` to `event: '*'` (listen for INSERT, UPDATE, and DELETE)
- Handle UPDATE events by replacing the matching message in the query cache
- Handle DELETE events by removing the message from cache

**Fix 2: `src/components/workspace/ProjectWorkspaceV3.tsx`**
- After updating the placeholder message via `.update()`, invalidate the `project-messages` query to force a refetch as a safety net
- Add the AI's personalized response message (the `aiMessage` from metadata) as a **separate** assistant message so it persists independently from the file summary

---

## Part 2: Upgrade AI Design Quality to Commercial Grade

**File: `supabase/functions/buildable-generate/pipeline/core-directive.ts`**

Add a new `COMMERCIAL_GRADE_CSS` section with:
- **Advanced CSS animations**: keyframe definitions for fade-in-up, slide-in, scale-in, shimmer, pulse-glow, gradient-shift
- **Scroll-triggered animations**: IntersectionObserver pattern with staggered delays per card/element
- **Glassmorphism v2**: Multi-layer glass with inner shadows, border gradients using `bg-gradient-to-br` on pseudo-elements
- **Typography refinements**: Variable font weights, optical sizing, proper `text-balance` for headlines
- **Depth and layering**: Multiple overlapping gradients, radial gradients for spotlight effects, mesh gradient patterns
- **Motion design**: CSS `@keyframes` for floating elements, parallax-lite scroll effects, smooth page transitions
- **Shadow system**: Layered shadows (shadow-sm + shadow-lg + shadow-color) for realistic depth

**File: `supabase/functions/buildable-generate/pipeline/routing.ts`**

Upgrade model routing for maximum quality:
- **Planning**: Switch to `gemini-2.5-pro` (currently using flash) for richer architectural plans
- **Coding**: Use `gemini-2.5-pro` as primary for new projects (high complexity), keep `gemini-2.5-flash` for edits/fixes
- **Increase max tokens**: Bump coding tasks from 16,000 to 16,000 (already at max, but ensure the full budget is used)
- **Temperature tuning**: Set coding temperature to 0.3 (more deterministic = fewer errors) and planning to 0.6 (more creative)

**File: `supabase/functions/buildable-generate/pipeline/stages/generate.ts`**

Enhance the code generation prompt:
- Add explicit CSS animation blocks that must be included in `src/index.css`
- Require IntersectionObserver-based scroll animations in every project
- Add a "visual checklist" to the prompt: gradient text, animated hero badge, staggered card grid, floating background elements, smooth scroll behavior
- Upgrade fallback templates with richer default animations and transitions

---

## Part 3: Add Home Button to Dashboard

**File: `src/components/dashboard/DashboardSidebar.tsx`**
- Add a "Home" link at the top of the navigation items list that routes to `/` (the main landing page)
- Use the `Home` icon from lucide-react
- Place it before "Projects" in the nav list

**File: `src/components/workspace/WorkspaceTopBarV2.tsx`**
- The workspace top bar already has a logo link -- verify it links to `/dashboard` and add a small home icon/tooltip that goes to `/` (the public homepage)

---

## Technical Details

### Realtime Subscription Fix

The current subscription code:
```text
event: 'INSERT'  -->  event: '*'
```

The UPDATE handler will match by `payload.new.id` and replace the message in the cache, ensuring placeholder updates are reflected immediately.

### Animation System (injected into index.css via AI generation)

The directive will require these keyframes in every generated project:
```text
@keyframes fade-in-up: 0% opacity-0 translateY(20px) -> 100% opacity-1 translateY(0)
@keyframes slide-in-left: 0% opacity-0 translateX(-30px) -> 100% opacity-1 translateX(0)
@keyframes scale-in: 0% opacity-0 scale(0.95) -> 100% opacity-1 scale(1)
@keyframes shimmer: 0% translateX(-100%) -> 100% translateX(100%)
@keyframes float: 0% translateY(0) -> 50% translateY(-10px) -> 100% translateY(0)
```

### Files Changed Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/useProjectMessages.ts` | Modify | Fix realtime to listen for INSERT + UPDATE + DELETE |
| `src/components/workspace/ProjectWorkspaceV3.tsx` | Modify | Save AI personalized message separately, invalidate cache after updates |
| `supabase/functions/buildable-generate/pipeline/core-directive.ts` | Modify | Add commercial-grade CSS animation standards |
| `supabase/functions/buildable-generate/pipeline/routing.ts` | Modify | Upgrade model selection for higher quality output |
| `supabase/functions/buildable-generate/pipeline/stages/generate.ts` | Modify | Enhanced prompt with animation requirements and visual checklist |
| `src/components/dashboard/DashboardSidebar.tsx` | Modify | Add Home button to sidebar navigation |

