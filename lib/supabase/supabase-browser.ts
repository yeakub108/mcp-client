"use client";

import { createBrowserClient } from '@supabase/ssr';

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Create a Supabase client for use in browser components
 * This uses a singleton pattern to avoid multiple instances
 */
export function createSupabaseBrowserClient() {
  if (supabaseInstance) return supabaseInstance;

  // Create new client if one doesn't exist
  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storageKey: 'supabase-auth',
        detectSessionInUrl: true,
        autoRefreshToken: true,
      }
    }
  );
  
  return supabaseInstance;
}

// Export a singleton instance
export const supabase = createSupabaseBrowserClient();
