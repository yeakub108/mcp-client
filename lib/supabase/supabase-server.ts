import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Create a Supabase client for use in server components
 */
export function createSupabaseServerClient() {
  // Get the cookies from the request
  const cookieStore = cookies();

  // Create a new Supabase browser client
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        // Get a cookie with the specified name
        get(name) {
          // Use JavaScript fallbacks for undefined
          return cookieStore.get(name)?.value;
        },
        // Set a cookie with the specified name, value, and options
        set(name, value, options) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // This can fail in middleware or server actions
            console.error(`Error setting cookie: ${name}`, error);
          }
        },
        // Remove a cookie with the specified name and options
        remove(name, options) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          } catch (error) {
            // This can fail in middleware or server actions
            console.error(`Error removing cookie: ${name}`, error);
          }
        },
      },
    }
  );
}

export async function getSession() {
  const supabase = createSupabaseServerClient();
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session: data.session, error: null };
  } catch (error) {
    console.error('Error getting session:', error);
    return { session: null, error };
  }
}
