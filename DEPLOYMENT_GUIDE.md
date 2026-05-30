# BukieBrain Waitlist — Complete Deployment Guide

This guide walks you through deploying your waitlist site to **3 platforms** so it's live and collecting real data.

---

## Overview of the 3 Platforms

| Platform | What it does | Cost |
|----------|-------------|------|
| **GitHub** | Stores your code (like a cloud folder) | Free |
| **Supabase** | Saves all signup data (database) | Free tier |
| **Vercel** | Hosts your website (makes it live) | Free |

**The flow:**
1. Push code to GitHub
2. Set up Supabase database (where signups get stored)
3. Deploy to Vercel (connects GitHub + Supabase)

---

## PART 1: Push Your Code to GitHub

### Step 1: Create a GitHub account
- Go to [github.com](https://github.com)
- Click **Sign up** and follow the steps
- Verify your email

### Step 2: Create a new repository
1. On GitHub, click the **+** button (top right) → **New repository**
2. Name it: `bukiebrain-waitlist`
3. Make it **Public** (or Private if you prefer)
4. Click **Create repository**

### Step 3: Upload your code
You have 2 options. Pick the easier one:

#### Option A: Drag & Drop (Easiest)
1. Download the `bukiebrain-waitlist.tar.gz` file I gave you
2. Extract it (double-click on Mac, or use 7-Zip on Windows)
3. You should see a `deploy` folder with files inside
4. On GitHub, in your new repo, click **Uploading an existing file**
5. Drag ALL files from the `deploy` folder into the GitHub page
6. Click **Commit changes**

#### Option B: Using Git (Terminal)
Open a terminal in the `deploy` folder and run:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bukiebrain-waitlist.git
git push -u origin main
```

**Done!** Your code is now on GitHub.

---

## PART 2: Set Up Supabase (Your Database)

### Step 1: Create a Supabase account
- Go to [supabase.com](https://supabase.com)
- Click **Start your project** → Sign up with GitHub (easiest)
- Create a new organization (call it anything, e.g., "BukieBrain")

### Step 2: Create a new project
1. Click **New project**
2. Choose your organization
3. Name: `bukiebrain-db`
4. Database password: generate a strong one (click the random button) — **Save this somewhere!**
5. Region: Pick the closest one to you (e.g., `South Africa (Cape Town)` for Nigeria)
6. Click **Create new project**

Wait 2-3 minutes for the project to spin up.

### Step 3: Create the database tables

Once your project is ready, you need to create 2 tables where signup data will be stored.

#### Table 1: `waitlist` (main form submissions)

1. In the left sidebar, click **Table Editor**
2. Click **Create a new table**
3. Fill in:
   - Name: `waitlist`
   - Enable **Row Level Security** → keep it **ON** → Click **Confirm**

4. Add these columns (one by one):
   | Column Name | Type | Default Value | Is Nullable |
   |-------------|------|---------------|-------------|
   | `full_name` | `text` | (leave empty) | **NO** |
   | `phone` | `text` | (leave empty) | **NO** |
   | `email` | `text` | (leave empty) | **NO** |
   | `location` | `text` | (leave empty) | **NO** |
   | `role` | `text` | (leave empty) | **NO** |
   | `preferred_cities` | `text[]` | (leave empty) | **YES** |
   | `trade` | `text` | (leave empty) | **YES** |
   | `service_area` | `text` | (leave empty) | **YES** |
   | `specialty` | `text` | (leave empty) | **YES** |
   | `portfolio` | `text` | (leave empty) | **YES** |
   | `help_needed` | `text` | (leave empty) | **YES** |
   | `budget` | `text` | (leave empty) | **YES** |

5. The `id` and `created_at` columns are already created automatically. Don't touch them.
6. Click **Save**

#### Table 2: `hero_emails` (quick email captures)

1. Click **Create a new table** again
2. Name: `hero_emails`
3. Enable **Row Level Security** → keep it **ON** → Click **Confirm**
4. Add one column:
   | Column Name | Type | Is Nullable |
   |-------------|------|-------------|
   | `email` | `text` | **NO** |
5. Click **Save**

#### IMPORTANT: Enable public writes

By default, Supabase blocks writes for security. We need to allow anonymous users to submit data.

1. Go to **SQL Editor** (in the left sidebar)
2. Click **New query**
3. Paste this SQL code and click **Run**:

```sql
-- Allow anyone to insert into waitlist
CREATE POLICY "Allow public inserts on waitlist" ON waitlist
  FOR INSERT TO anon WITH CHECK (true);

-- Allow anyone to insert into hero_emails
CREATE POLICY "Allow public inserts on hero_emails" ON hero_emails
  FOR INSERT TO anon WITH CHECK (true);
```

**Done!** Your database is ready.

### Step 4: Get your Supabase credentials

1. In the left sidebar, click **Project Settings** (gear icon, bottom)
2. Click **API** in the left sidebar
3. Copy these two values (you'll need them in the next part):
   - **Project URL** (looks like `https://abcdefgh12345678.supabase.co`)
   - **anon public** key (a long string of letters and numbers)

---

## PART 3: Deploy to Vercel (Go Live)

### Step 1: Create a Vercel account
- Go to [vercel.com](https://vercel.com)
- Click **Sign Up** → **Continue with GitHub**
- Authorize Vercel to access your GitHub

### Step 2: Import your project
1. Click **Add New...** → **Project**
2. You'll see your GitHub repos. Find **bukiebrain-waitlist**
3. Click **Import**

### Step 3: Configure Environment Variables

This is where you connect your Supabase database to your website.

1. On the Vercel project setup page, scroll down to **Environment Variables**
2. Add these two:

   | Variable Name | Value |
   |---------------|-------|
   | `VITE_SUPABASE_URL` | Paste your Supabase **Project URL** |
   | `VITE_SUPABASE_ANON_KEY` | Paste your Supabase **anon public** key |

3. Click **Add** after each one
4. Click **Deploy**

Vercel will build and deploy your site. This takes about 1-2 minutes.

### Step 4: Your site is LIVE!

- Vercel will show you a **URL** like `https://bukiebrain-waitlist.vercel.app`
- Click it — your site is live!
- Share this URL with anyone

### Step 5: Test it works

1. Open your live site
2. Fill out the waitlist form
3. Click **Claim My Spot**
4. Go to Supabase → **Table Editor** → `waitlist`
5. You should see your test entry!

---

## How to Update Your Site Later

If you ever need to make changes:

1. Edit your code locally
2. Push to GitHub: `git add .` → `git commit -m "changes"` → `git push`
3. Vercel automatically redeploys within seconds!

---

## How to View Your Signups

1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Click **Table Editor**
4. Click `waitlist` or `hero_emails`
5. See all entries in real-time

You can also:
- Export data to CSV
- Set up email notifications (using Supabase Edge Functions)
- Connect to Zapier or Make.com for automation

---

## Troubleshooting

**"Build failed" on Vercel**
- Check the **Build Logs** in your Vercel dashboard
- Most likely you missed an environment variable
- Make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

**"Error saving entry" on the form**
- Check Supabase → **SQL Editor** → Did you run the RLS policy code?
- Make sure the table names are exactly `waitlist` and `hero_emails`
- Make sure column names match exactly (with underscores, e.g., `full_name`)

**Site looks blank**
- Check browser console (F12) for errors
- Make sure all files were uploaded to GitHub

---

## Next Steps (Optional)

1. **Custom domain**: In Vercel settings, add your own domain (e.g., `waitlist.bukiebrain.com`)
2. **Email notifications**: Use Supabase Edge Functions to send you an email when someone signs up
3. **Analytics**: Add Google Analytics or Vercel Analytics
4. **SEO**: Update the `index.html` title and description

---

## Cost Summary

| Platform | Free Tier Limits |
|----------|-----------------|
| GitHub | Unlimited public repos |
| Supabase | 500MB database, 2GB bandwidth |
| Vercel | 100GB bandwidth, 10,000 builds/month |

For a waitlist with hundreds or thousands of signups, the free tier is more than enough.

---

## Questions?

If you get stuck at any step, tell me exactly which step and what error message you see, and I'll help you fix it.

**Good luck! Your BukieBrain waitlist will be live very soon.**
