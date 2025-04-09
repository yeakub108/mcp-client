/**
 * Connectivity check utility to validate Supabase connection
 */

export async function checkDnsResolution(hostname: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Try to fetch a small resource from the domain to check DNS resolution
    const response = await fetch(`https://${hostname}/favicon.ico`, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    return true; // If we get here, DNS resolution worked
  } catch (error) {
    console.error(`DNS resolution failed for ${hostname}:`, error);
    return false;
  }
}

export async function testSupabaseConnection(supabaseUrl: string): Promise<boolean> {
  try {
    if (!supabaseUrl) return false;
    
    // Extract the hostname from the URL
    const url = new URL(supabaseUrl);
    const hostname = url.hostname;
    
    // First check if we can resolve the hostname
    const canResolve = await checkDnsResolution(hostname);
    if (!canResolve) {
      console.error(`Cannot resolve Supabase hostname: ${hostname}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return false;
  }
}
