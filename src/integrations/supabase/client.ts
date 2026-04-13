import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://qleksthbttgdfngvrzku.supabase.co";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZWtzdGhidHRnZGZuZ3Zyemt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwOTY1NTgsImV4cCI6MjA5MTY3MjU1OH0.aqTO8z5j5hFtn9E-_Q-BNv_7nX7LfkV6aweJeHsTSJE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
