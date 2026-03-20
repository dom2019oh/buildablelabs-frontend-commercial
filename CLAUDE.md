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

## Last Updated

**2026-03-13** — Session summary:
- Full dashboard redesign (Lovable.dev-inspired): gradient hero, centered prompt, sidebar with workspace dropdown & recents
- SettingsView migrated from Supabase to Firestore
- BillingView replaced with clean plan-card stub (no Stripe yet)
- DashboardTopBar removed — sidebar handles all user identity/nav
- `useAuth.tsx` loading fix: `setLoading(false)` fires immediately in `onAuthStateChanged`
