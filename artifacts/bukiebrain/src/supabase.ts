import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: true, persistSession: false },
});

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
