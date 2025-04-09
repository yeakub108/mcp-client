import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Create a Supabase client for use in server components
 */
export function createSupabaseServerClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          try {
            // @ts-expect-error - Bypass TypeScript checking since cookies() API is synchronous at runtime
            return cookies().get(name)?.value;
          } catch (e) {
            console.error("Error getting cookie:", e);
            return undefined;
          }
        },
        set(name, value, options) {
          try {
            // @ts-expect-error - Bypass TypeScript checking since cookies() API is synchronous at runtime
            cookies().set(name, value, options);
          } catch (e) {
            console.error(`Error setting cookie ${name}:`, e);
          }
        },
        remove(name, options) {
          try {
            // @ts-expect-error - Bypass TypeScript checking since cookies() API is synchronous at runtime
            cookies().set(name, "", { ...options, maxAge: 0 });
          } catch (e) {
            console.error(`Error removing cookie ${name}:`, e);
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
    console.error("Error getting session:", error);
    return { session: null, error };
  }
}
