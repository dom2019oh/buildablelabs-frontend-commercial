# Buildable Labs — Frontend

AI-powered Discord bot builder. Describe a bot in plain English → Buildable builds, deploys, and hosts it instantly.

## Dev

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → /dist
```

## Stack

- React 18, Vite, TypeScript, TailwindCSS
- Framer Motion, GSAP
- Supabase (auth + db + edge functions)
- shadcn/ui, Lucide icons

## Environment variables

Supabase project secrets:
```
OPENROUTER_API_KEY   # OpenRouter API key (for AI generation)
```

`.env.local` for local dev:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
