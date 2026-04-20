import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ahvivjsmhbwbjthtiudt.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodml2anNtaGJ3Ymp0aHRpdWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MzY5NjAsImV4cCI6MjA3NzAxMjk2MH0.ptniNhKLjj0DZ1zPYq7cXTtY9fBHBIvi4Kkzmy7ZC5E";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const createServerSupabaseClient = () =>
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

export const createAuthenticatedServerSupabaseClient = (accessToken: string) =>
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
