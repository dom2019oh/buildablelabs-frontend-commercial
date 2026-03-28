# Buildable Labs — Claude Code Project Guide

This file is read automatically at the start of every session. Keep it up to date after every meaningful change.

---

## What This Project Is

**Buildable Labs** (buildablelabs.dev) — AI Discord bot vibe coder.
Users describe a bot in plain English → Buildable AI generates code → deploys & hosts it.
- Plans: Free + Pro (usage-based credits)
- Competing against: Bot Ghost

---

## Deployment

- **Live site**: https://buildablelabs.dev (Firebase Hosting)
- **Project ID**: `buildablelabs-42259`
- **Deploy command**: `npm run build && firebase deploy --only hosting`
- Git push does NOT auto-deploy. Always run the deploy command manually.
- Dev server: `npm run dev -- --port 5173` → http://localhost:5173

---

## Key Files

| File | Purpose |
|------|---------|
| `src/pages/Index.tsx` | Main hero page — all hero sections live here |
| `src/index.css` | Global styles, CSS variables, keyframe animations |
| `src/components/AIThinkingOrb.tsx` | Hero 3D canvas orb (Fibonacci sphere + pulse waves) |
| `src/components/CardNav.tsx` | GSAP-animated nav (hamburger → 3 colored cards) |
| `src/components/home/BuildableSimulation.tsx` | Multi-phase simulation section (Prompt→Thinking→Building→Deploying→Live) |
| `src/components/home/HowItWorks.tsx` | 3-step how it works section |
| `src/assets/logo.svg` | 4-pointed star sparkle logo |
| `public/grant-dev-logo.png` | Grant Development partner logo (already white — no CSS filter) |

---

## Hero Page Layout (top → bottom)

1. Flat header (no Navbar component — navless style)
2. **Two-column hero**: `AIThinkingOrb` canvas (left) + badge / H1 / subtitle / CTA buttons (right)
3. **TechLogos marquee** — "Powered by Trusted 3rd Party Enhancements" (pure CSS animation, seamless loop)
4. **BuildableSimulation** — live simulation: Prompt → Thinking → Building → Deploying → Live (Discord demo)
5. **HowItWorks** — 3 cards, scroll-revealed
6. Footer

---

## Design System

- **Background**: `#080a0c` base + Grainient WebGL shader (`color1="#3a3c42"`, `color2="#141518"`, `color3="#252729"`, `timeSpeed={0.35}`)
- **Fonts**: `Syne` 800 (display headlines) · `Instrument Serif` italic (accent) · `DM Sans` (body)
- **Theme**: dark outer-space, neutral silver-grey palette — NO bright whites, NO heavy purple
- **Glass buttons**: `rgba(255,255,255,0.08)` bg + `1px solid rgba(255,255,255,0.14)`
- **CSS variables** (in `index.css`): `--background: 220 8% 5%`, `--foreground: 0 0% 88%`, etc.

---

## AIThinkingOrb

- `src/components/AIThinkingOrb.tsx`
- Canvas 800×800, displayed at `min(100%, 520px)`
- 300 Fibonacci-distributed particles on sphere radius 340, FOV 780
- Pulse wave physics (spherical law of cosines for angular distance)
- Cycling shimmer text underneath (4500ms interval), Buildable-specific phrases
- Rotation speed: `rotY += 0.006` per frame

## MiniOrb (inside BuildableSimulation)

- Defined inline in `BuildableSimulation.tsx` as `function MiniOrb({ size })`
- 90 particles, radius 44, faster rotation (`rotY += 0.022`)
- Used at 36px (Thinking phase), 28px (Building phase), 64px (Deploying phase)

---

## BuildableSimulation

- `src/components/home/BuildableSimulation.tsx`
- Test user: **James** (`james@buildable:~$`, Discord username `james`)
- Discord bot: **MusicBot** · Channel: **#music-bot-test**
- Secondary Discord users: `sarah_m`, `dan_c`
- Auto-advances on scroll into view (`useInView`)
- Phase machine: prompt (typewriter) → thinking (AI orb + steps) → building (code gen) → deploying (steps) → live (Discord)

---

## TechLogos Marquee

- Pure CSS `@keyframes marqueeScroll` animation (NOT Framer Motion — avoids snap-reset bug)
- Duration: 38s linear infinite
- Logos doubled (`[...logos, ...logos]`) and animated to `translateX(-50%)` for seamless loop
- All logos use `filter: brightness(0) invert(1)` EXCEPT `grant-dev-logo.png` (`noFilter: true`)
- Current logos: GitHub, Railway, Discord, Squarespace, OpenAI, Anthropic, Gemini, ElevenLabs, Firebase, Cloudflare, Grant Development

---

## CardNav

- `src/components/CardNav.tsx`
- GSAP-animated, ReactBits-inspired
- 3 categories: Solutions · Resources · About Us (4 sub-links each)
- Right side: avatar dropdown (logged in) or "Get Started" button (logged out) — dark glass style
- "Open Dashboard" button style: `background: rgba(255,255,255,0.08)`, `border: 1px solid rgba(255,255,255,0.14)`

---

## Important Rules

- **Never edit** `/c/Users/dom20/Documents/buildable-labs-workspace/` — that is NOT the live site
- **Always build + deploy** after changes: `npm run build && firebase deploy --only hosting`
- The site supports multiple languages (not Python only) — keep copy and simulations language-agnostic where possible
- Do not add features beyond what is asked
- No emojis in responses unless asked

---

## Backend

- **Repo**: `dom2019oh/buildablelabs-backend-commercial` (also mirrored to `buildablelabs-backend`)
- **Live URL**: https://api.buildablelabs.dev (Railway)
- **Runtime**: Bun + Hono
- **Auth**: Firebase Admin SDK — verifies Firebase ID tokens (NOT Supabase)
- **Database**: Firebase Firestore — collections: `workspaces`, `workspaceFiles`, `generationSessions`, `fileOperations`
- **AI**: OpenAI (gpt-4o) active now. Anthropic (claude-sonnet-4-6) ready — switch `DEFAULT_AI_PROVIDER=anthropic` when credits arrive in April
- **Local dev**: `cd /c/Users/dom20/buildablelabs-backend && bun run dev`

### Backend Key Env Vars (Railway)
| Var | Notes |
|-----|-------|
| `FIREBASE_PROJECT_ID` | `buildablelabs-42259` |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Base64-encoded service account JSON |
| `OPENAI_API_KEY` | Active |
| `DEFAULT_AI_PROVIDER` | `openai` — change to `anthropic` when credits arrive |
| `CORS_ORIGINS` | Includes `dashboard.buildablelabs.dev` |

---

## Dashboard

- Routes live under `/dashboard/*` in the frontend SPA
- `dashboard.buildablelabs.dev` CNAME → `buildablelabs-42259.web.app` (DNS only in Cloudflare)
- Key components:
  - `src/components/dashboard/DashboardSidebar.tsx` — Lovable-style narrow sidebar (176px), workspace dropdown, grouped nav, recents, Share/Upgrade CTAs
  - `src/components/dashboard/DashboardLayout.tsx` — sidebar + main. Pass `noPadding` for ProjectsView.
  - `src/components/dashboard/ProjectsView.tsx` — gradient hero background, "Ready to build, [Name]?" prompt input, tabs (Recently viewed / My Bots / Templates), bot grid
  - `src/components/dashboard/ProjectCard.tsx` — card with template emoji, status, language badge
  - `src/components/dashboard/NewBotGuide.tsx` — 3-step wizard (template → details → review)
  - `src/components/dashboard/SettingsView.tsx` — Lovable-style left-panel settings (uses Firestore, NOT Supabase)
  - `src/components/dashboard/BillingView.tsx` — stub plan cards (Free/Pro/Business) — Stripe not yet integrated
  - `src/hooks/useProjects.ts` — Firestore real-time project list
- Dashboard home submits prompts directly: `createProject(name, { prompt })` → navigate to `/dashboard/project/:id`

---

## Tech Stack Notes

- **NO Supabase** — fully removed. `@supabase/supabase-js` is not in package.json.
- **All AI calls go through the backend** (`API_BASE` in `src/lib/urls.ts`). No API keys on the frontend.
- Firebase client config (`VITE_FIREBASE_*`) is intentionally public — security is enforced by Firestore Security Rules.

### Key Firestore Collections
| Collection | Written by | Read by |
|---|---|---|
| `workspaces` | Backend | Frontend (onSnapshot) |
| `workspaceFiles` | Backend + frontend edits | Frontend (onSnapshot) |
| `generationSessions` | Backend | Frontend (onSnapshot) |
| `fileOperations` | Backend | Frontend |
| `projectMessages` | Frontend | Frontend |
| `projectFiles` | Frontend | Frontend |
| `fileVersions` | Frontend | Frontend |
| `projects` | Frontend | Frontend |
| `userCredits/{uid}` | **Backend only (Admin SDK)** | Frontend (onSnapshot, read-only) |
| `subscriptions/{uid}` | **Backend only (Stripe webhook)** | Frontend (read-only) |
| `creditTransactions/{txId}` | **Backend only (Admin SDK)** | Frontend (read-only) |

### Credit System Security
- **Firestore rules**: `userCredits`, `subscriptions`, `creditTransactions` are all `allow write: if false` on the client — only the backend Admin SDK can write
- **useCredits hook**: All credit data via `onSnapshot` (real-time, cannot be stale). Claim calls `POST /api/credits/claim` — server enforces UTC date check, SET not +=
- **Generation gate**: `checkAndDeductCredits()` in `generate.ts` runs atomically before any AI pipeline — 402 returned if insufficient
- **Backend credit API** (`src/api/credits.ts`): `POST /initialize`, `POST /claim`, `GET /` — all require Firebase Bearer token
- **No client-side credit writes** — `useCredits.deductCredits` is a no-op stub; all real deductions go through backend

### Backend API Endpoints (all require Firebase Bearer token)
- `POST /api/workspace` — get or create workspace
- `POST /api/generate/:workspaceId` — generate code (AI)
- `GET /api/workspace/:id/files` — list workspace files
- `POST /api/billing/checkout` — Stripe checkout (Stripe not live yet)
- `POST /api/billing/portal` — Stripe portal
- `POST /api/github-export` — GitHub export
- `POST /api/speech-to-text` — voice transcription
- `POST /api/chat` — AI chat messages

## Debug Log System

- Backend writes all 4xx/5xx errors to Firestore `_debugLogs` collection automatically
- Frontend unhandled errors POST to `/api/internal/logs/client-error`
- Read logs anytime: `node scripts/read-logs.mjs` (from frontend root)
- Clear logs: `node scripts/read-logs.mjs --clear`
- Key: `buildable-debug-2026` (sent via `x-log-key` header, not query string — Cloudflare WAF blocks key= params)

## Known Infrastructure Notes

- **Firestore on Railway uses REST, not gRPC** — `preferRest: true` is set in `src/index.ts` on the backend. Do NOT remove this. gRPC is blocked on Railway's network and will cause all Firestore calls to hang silently.
- **CORS_ORIGINS on Railway** must include `https://dashboard.buildablelabs.dev,https://buildablelabs.dev` (full URLs with `https://`). Missing the protocol prefix causes CORS failures.
- **Cloudflare WAF** blocks requests with `key=` query string params on `/api/` routes. Use headers instead.

---

## Last Updated

**2026-03-28 (session 2)** — Infrastructure fixes + debug log system:
- Fixed CORS: `CORS_ORIGINS` Railway env var updated to include `https://` prefix
- Fixed Firestore: switched to REST transport (`preferRest: true`) — gRPC was silently hanging on Railway, causing all workspace init to fail (the real cause of the 30s–1min load time)
- Fixed Firestore rules: `generationSessions` and `fileOperations` now use `get()` workspace ownership check (consistent with `workspaceFiles`) so collection queries work
- Added debug log system: `_debugLogs` Firestore collection, `/api/internal/logs/*` endpoints, `scripts/read-logs.mjs`
- CardSwap: restored classic animation logic, fixed text opacity on cards, removed emojis from card banner

**2026-03-28 (session 1)** — WorkspaceMode system + Dashboard prompt bar parity:

### WorkspaceMode (frontend + backend)
- Replaced the boolean `isPlanMode` toggle with a tri-state `WorkspaceMode = 'plan' | 'architect' | 'build'`
- `ChatInputV2.tsx` — full rewrite with Mode button + BorderGlow dropdown; exports `WorkspaceMode` and `MODE_CONFIG` (single source of truth)
  - Plan: blue glow `#3b82f6`, Architect: orange `#f97316`, Build: green `#22c55e`
  - Mode button shows colored dot + "Mode" label + rotating chevron
  - Dropdown uses `BorderGlow` with per-mode glow color, click-outside to dismiss
  - Textarea placeholder updates per mode
- `ChatPanelV2.tsx` — holds `mode: WorkspaceMode` state (default `'build'`), passes to `ChatInputV2` and `onSendMessage`
- `ProjectWorkspaceV3.tsx` — `handleSendMessage(content, mode)` threads mode to `useBuildableAI.generate()`
- `useBuildableAI.ts` — `generate()` accepts optional `mode` param (last arg), includes in POST body
- `useWorkspace.ts` — `generate(prompt, mode?)` passes mode to backend API
- `useWorkspaceChat.ts` — `sendMessage(content, mode?)` threads through to `generate()`
- `ProjectsView.tsx` — Dashboard prompt bar now matches workspace: same Mode button + BorderGlow dropdown; outer BorderGlow dynamically shifts glow color to match selected mode; imports `WorkspaceMode` and `MODE_CONFIG` from `ChatInputV2`

### Backend: mode-aware pipeline (`buildablelabs-backend`)
- `generate.ts` — schema now accepts `mode: enum(['plan','architect','build'])` (default `'build'`); also accepts `projectId`, `conversationHistory`, `existingFiles` as optional passthroughs
- `pipeline.ts` — `PipelineOptions` has `mode?: WorkspaceMode`; `run()` dispatches to:
  - `runPlanMode()` — Architect phase only → writes `PLAN.md` to workspace files, no code generated
  - `runArchitectMode()` — Architect phase → writes `ARCHITECTURE.md` (Mermaid dependency graph + command flow diagram) + `PLAN.md`
  - `runBuildMode()` — full 4-phase pipeline (plan → scaffold → generate → validate), unchanged behavior

### Billing route cleanup
- `/dashboard/billing` route removed — replaced with `<Navigate to="/dashboard/settings?tab=billing" replace />`
- All 7 navigation points across the codebase updated to use `settings?tab=billing`
- All settings navigation now uses `settings?tab=` prefix consistently

### Other changes this session
- `BorderGlow.tsx` + `BorderGlow.css` — new component (mouse-proximity edge glow, animated conic-gradient border)
- `WorkspaceTopBarV2.tsx` — Preview tab now uses Discord SVG icon (replacing Globe); on-page section header renamed to "Live Discord Simulator"
- `useWorkspace.ts` — retry config: `retry: 4`, exponential backoff up to 20s (Railway cold-start tolerance)
- `ProjectWorkspaceV3.tsx` — card stack redesign: double-rim border trick, solid ghost card backgrounds, per-template BorderGlow with colored banner header, proper Discord dark theme colors in empty state

**2026-03-25 (session 2)** — Credit system security hardening:
- Firestore rules locked: `userCredits`, `subscriptions`, `creditTransactions` → `allow write: if false` (client can only read)
- `useCredits.ts` rewritten: credits now via `onSnapshot` (real-time), claim + initialize call backend API
- `src/api/credits.ts` mounted at `/api/credits` in backend `index.ts`
- `BillingView.tsx` now shows live credit count + progress bar + countdown
- `DashboardSidebar.tsx` now shows credit pill with "Claim" badge when daily credits are available
- Deployed: Firebase hosting + Firestore rules + backend pushed to Railway

**2026-03-25 (session 1)** — Session summary:
- Firebase Storage enabled (Blaze plan) — created `storage.rules` (authenticated users can write their own avatar, public read), added storage section to `firebase.json`, deployed rules
- Avatar upload fixed in `SettingsView.tsx` — was silently hanging due to missing storage rules
- Avatar size increased from `h-14 w-14` to `h-20 w-20`, added explicit `object-fit: cover` to `AvatarImage` in SettingsView, CardNav, and DashboardSidebar
- `useAuth.tsx` switched from `getDoc` (one-time) to `onSnapshot` (real-time) for profile — avatar updates now propagate live across all components/domains without page refresh
- Logo updated site-wide: `logo-stack-white.svg` (three-bar icon mark from `public/`) paired with `buildable-wordmark.svg` (imported via Vite from `src/assets/`) — replaces old `buildable-logo.png` + `buildable-text.svg` / `buildable-wordmark.svg` combo
  - Updated: `CardNav.tsx`, `FloatingNav.tsx`, `Navbar.tsx`, `Index.tsx` (footer), `Login.tsx`, `SignUp.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`, `Onboarding.tsx`
  - `buildable-wordmark.svg` must be imported via Vite (`import wordmarkSvg from "@/assets/buildable-wordmark.svg"`) — serving from `public/` as a static URL causes broken image in browser
  - `public/buildable-wordmark.svg` copy exists but is not used — Vite import is the correct approach

**2026-03-24** — Session summary:
- Deleted dead code: `ProjectEditor.tsx` and `ProjectDetailView.tsx` (unused — `DashboardProject` uses `ProjectWorkspaceV3`)
- Restyled workspace to match dark glass design system:
  - `ProjectWorkspaceV3`: BG changed from `#1A1A1A` to `#0e0d12`; floating "Open Chat" button restyled to dark glass
  - `WorkspaceTopBarV2`: active mode tab changed from `#2563EB` blue to neutral `rgba(255,255,255,0.12)` glass
  - `ChatPanelV2`: zinc-900/800/700 backgrounds replaced with dark glass; bubble colors unified
  - `ChatInputV2`: all zinc classes replaced with dark glass inline styles; send button matches dashboard style
  - `FileExplorer`: purple `--accent` selected state replaced with dark glass; chevrons/empty state restyled
  - `CodeViewer`: filename + button labels use proper opacity-white colors

**2026-03-20** — Session summary:
- Committed & pushed all previously uncommitted changes (dashboard redesign, Firebase config files, new pages)
- Completed full Firebase migration: Supabase removed entirely
- All hooks (useCredits, useProjectFiles, useFileVersions, useProjectMessages, useWorkspaceChat, useWorkspace, usePublishSystem) migrated to Firestore
- useWorkspace now calls backend API for workspace create and AI generation
- Firebase Storage used for avatars (Settings.tsx) and published sites (usePublishSystem)
- useSubscriptionPlans replaced with static config (Stripe not live yet)
- API keys enforced server-side only via backend API with Firebase Bearer token auth
