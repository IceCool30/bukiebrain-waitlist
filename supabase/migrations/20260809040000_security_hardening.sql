-- Security hardening for BukieBrain waitlist.
-- Apply this migration in the Supabase project before exposing the admin dashboard.

-- RLS is the authorization boundary for the browser's anon/authenticated key.
alter table public.waitlist enable row level security;
alter table public.hero_emails enable row level security;

-- Remove broad policies if they were created during development.
drop policy if exists "public can read waitlist" on public.waitlist;
drop policy if exists "public can update waitlist" on public.waitlist;
drop policy if exists "public can delete waitlist" on public.waitlist;
drop policy if exists "public can read hero emails" on public.hero_emails;
drop policy if exists "public can update hero emails" on public.hero_emails;
drop policy if exists "public can delete hero emails" on public.hero_emails;

-- Waitlist and hero-email forms are public write-only endpoints.
-- SELECT/UPDATE/DELETE remain denied to anon users by the absence of policies.
drop policy if exists "public can submit waitlist" on public.waitlist;
create policy "public can submit waitlist"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "public can submit hero email" on public.hero_emails;
create policy "public can submit hero email"
  on public.hero_emails
  for insert
  to anon, authenticated
  with check (true);

-- Only users whose Supabase JWT has app_metadata.role = admin may read PII.
-- Set this claim server-side/Admin API; never accept it from client input.
drop policy if exists "admins can read waitlist" on public.waitlist;
create policy "admins can read waitlist"
  on public.waitlist
  for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins can read hero emails" on public.hero_emails;
create policy "admins can read hero emails"
  on public.hero_emails
  for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Explicitly prevent browser roles from mutating existing records.
drop policy if exists "admins can update waitlist" on public.waitlist;
drop policy if exists "admins can delete waitlist" on public.waitlist;
drop policy if exists "admins can update hero emails" on public.hero_emails;
drop policy if exists "admins can delete hero emails" on public.hero_emails;
