# BukieBrain Waitlist

Nigeria's Chat-First Job Marketplace waitlist landing page.

## What's included

- **React + Vite** app with Tailwind CSS
- **Waitlist signup form** with full details (name, phone, email, role, cities, skills)
- **Hero email capture** — quick email signup at the top of the page
- **Dark mode** toggle
- **Supabase integration** — all signups are saved to your Supabase database
- **Fully responsive** — mobile, tablet, desktop

## Quick Start (3 steps)

### Step 1: Create your Supabase database

1. Go to [supabase.com](https://supabase.com) and sign up (free tier is fine)
2. Create a **New Project**
3. In the left sidebar, click **Table Editor** → **New table**

**Create the first table:**
- Name: `waitlist`
- Enable **Row Level Security** (keep it on for safety)
- Columns to add:
  - `id` (uuid, auto-generated) — leave as default
  - `full_name` (text, NOT NULL)
  - `phone` (text, NOT NULL)
  - `email` (text, NOT NULL)
  - `location` (text, NOT NULL)
  - `role` (text, NOT NULL) — options: `local_worker`, `remote_freelancer`, `hire_talent`
  - `preferred_cities` (text[]) — array of text
  - `trade` (text, nullable)
  - `service_area` (text, nullable)
  - `specialty` (text, nullable)
  - `portfolio` (text, nullable)
  - `help_needed` (text, nullable)
  - `budget` (text, nullable)
  - `created_at` (timestamp, auto-generated)

**Create the second table:**
- Name: `hero_emails`
- Enable **Row Level Security**
- Columns:
  - `id` (uuid, auto-generated)
  - `email` (text, NOT NULL)
  - `created_at` (timestamp, auto-generated)

### Step 2: Get your Supabase credentials

1. In your Supabase project, go to **Project Settings** (gear icon, bottom left)
2. Click **API** in the left sidebar
3. Copy these two values:
   - **Project URL** (e.g., `https://abcdefgh12345678.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

### Step 3: Deploy to Vercel

1. Push this project to **GitHub**:
   - Create a new repo on GitHub
   - Upload these files (or use `git push`)
2. Go to [vercel.com](https://vercel.com) and sign up with GitHub
3. Click **New Project** → Import your GitHub repo
4. In the project settings, add **Environment Variables**:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon public key
5. Click **Deploy**

Your site will be live at a `.vercel.app` URL. Every signup will be saved to your Supabase database.

## How to view your signups

- Log into Supabase → **Table Editor** → Click `waitlist` or `hero_emails`
- You will see all the entries in real-time

## Local development

```bash
# Install dependencies
npm install

# Create a .env file (copy from .env.example)
cp .env.example .env
# Edit .env and paste your Supabase URL and key

# Start the dev server
npm run dev
```

## Build

```bash
npm run build
```

The output goes to the `dist/` folder.

## Project structure

```
deploy/
  src/
    pages/WaitlistPage.tsx   → The main landing page (form + UI)
    lib/supabase.ts         → Supabase client + types
    components/ui/          → Form inputs, buttons, cards
    hooks/                  → Toast notifications
    assets/                 → Logo, avatars
  public/                   → Favicon, OpenGraph image
  index.html                → Entry HTML
  vite.config.ts            → Vite config
  vercel.json               → Vercel routing config
  package.json              → Dependencies
```

## Need help?

If anything goes wrong, check the **Vercel Deploy Logs** (in your Vercel dashboard) for error messages.
