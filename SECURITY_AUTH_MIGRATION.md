# Admin authentication migration

The admin dashboard uses Supabase Auth. The database RLS policies authorize reads only for authenticated users whose server-issued JWT has `app_metadata.role = admin`.

## Bootstrap the first administrator

Create the first admin user in Supabase Authentication using the dashboard. Then assign `role=admin` in that user's server-side `app_metadata` (not `user_metadata`). Never expose or store an admin password in a `VITE_*` environment variable.

After the user signs in, the dashboard queries are authorized by Postgres RLS.
