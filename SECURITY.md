# Security Notes

## Admin authentication

The admin dashboard must not use a `VITE_ADMIN_PASSWORD` or any other browser-bundled secret. `VITE_*` variables are public at runtime.

Use Supabase Auth for administrator sign-in and assign administrators the JWT `app_metadata.role = admin` server-side. Database access is then enforced by RLS rather than by a client-side session flag.

## Database protection

Apply `supabase/migrations/20260809040000_security_hardening.sql` to the production Supabase project. It enables RLS, permits public waitlist submissions without public reads, and limits PII reads to authenticated users with the server-issued `admin` role claim.

After applying it, verify that:

- anonymous users can INSERT a waitlist entry;
- anonymous users cannot SELECT, UPDATE, or DELETE waitlist rows;
- anonymous users can INSERT a hero email;
- anonymous users cannot SELECT, UPDATE, or DELETE hero emails;
- an authenticated non-admin cannot read either table;
- an authenticated admin with `app_metadata.role = admin` can read the required rows.

## Secret handling

Never commit real `.env` files, Supabase service-role keys, database passwords, or other server credentials. The Supabase anon key may be present in a browser application, but it is safe only when RLS policies correctly enforce authorization.
