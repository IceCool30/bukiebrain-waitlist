import { createClient } from "@supabase/supabase-js";

// These come from Vercel Environment Variables (or a .env file locally)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: true, persistSession: false },
});

// Waitlist entry type (matches the Supabase table)
export interface WaitlistEntry {
  id?: string;
  full_name: string;
  phone: string;
  email: string;
  location: string;
  role: "local_worker" | "remote_freelancer" | "hire_talent";
  preferred_cities: string[];
  trade?: string;
  service_area?: string;
  specialty?: string;
  portfolio?: string;
  help_needed?: string;
  budget?: string;
  created_at?: string;
}

export interface HeroEmailEntry {
  id?: string;
  email: string;
  created_at?: string;
}
