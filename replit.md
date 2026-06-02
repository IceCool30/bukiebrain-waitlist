# BukieBrain Waitlist

Nigeria's Chat-First Job Marketplace — a landing page and waitlist app that lets workers, freelancers, and clients sign up for early access before the platform launches on 20 January 2027.

## Run & Operate

- `pnpm --filter @workspace/bukiebrain run dev` — run the frontend (via workflow: `artifacts/bukiebrain: web`)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, Framer Motion, Wouter, React Hook Form, Zod
- Backend DB: Supabase (external) — uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- UI Components: shadcn/ui (Radix primitives)

## Where things live

- `artifacts/bukiebrain/src/pages/WaitlistPage.tsx` — the main landing/waitlist page (all sections)
- `artifacts/bukiebrain/src/supabase.ts` — Supabase client (reads env vars)
- `artifacts/bukiebrain/src/App.tsx` — router, wraps WaitlistPage
- `artifacts/bukiebrain/src/index.css` — CSS variables (theme, dark mode, fonts)
- `artifacts/bukiebrain/src/*.jpg / *.png` — avatar and logo image assets

## Architecture decisions

- This app uses Supabase (not Replit's built-in PostgreSQL) for data storage — the original Vercel app was wired to Supabase and the waitlist/hero_emails tables live there.
- No backend API routes needed — all data flows directly from frontend to Supabase via the JS SDK.
- The `artifacts/api-server` package is scaffolded but unused by this app.

## Product

- **Hero section**: Countdown timer, typewriter badge, email quick-capture, benefit preview card.
- **How It Works**: 3-step guide.
- **Features**: 6 platform feature cards.
- **Testimonials**: 3 beta user quotes.
- **Waitlist Form**: Role-based form (Local Worker / Remote Freelancer / Hire Talent) with city selector.
- **FAQ**: Accordion-style with 5 common questions.
- **Dark mode**: Persisted to localStorage, toggled via nav button.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Supabase env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) must be set as Replit secrets for the waitlist form to actually save data. The app renders fine without them (graceful placeholder fallback) but submissions will fail.
- The `VITE_` prefix is required for Vite to expose env vars to the browser.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
