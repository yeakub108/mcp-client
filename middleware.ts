import { NextResponse, type NextRequest } from 'next/server';

// Define protected and authentication routes
// Root route (/) is protected - users must be logged in to access it
// Only auth routes are fully public
const authRoutes = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  // Get all cookies and check for any Supabase auth cookies
  const cookies = request.cookies.getAll();
  
  // Check for any Supabase auth-related cookies (multiple possible formats)
  const hasAuthCookie = cookies.some(cookie => {
    const name = cookie.name.toLowerCase();
    return (
      // Check all possible Supabase cookie name patterns
      name.includes('supabase-auth') || 
      name.includes('sb-auth') || 
      name.startsWith('sb-') && (
        name.includes('-auth-token') || 
        name.includes('-access-token') || 
        name.includes('-refresh-token')
      )
    );
  });
  
  // We'll also check specifically for the refresh token as defined in our client
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const cookiePrefix = supabaseAnonKey.slice(0, 8).replace(/_/g, '-');
  const refreshToken = request.cookies.get(`sb-${cookiePrefix}-auth-refresh-token`)?.value;
  
  // Consider authenticated if we found any auth cookie or specific refresh token
  const isAuthenticated = hasAuthCookie || !!refreshToken;
  
  console.log(`[Middleware] Path: ${request.nextUrl.pathname}, Auth: ${isAuthenticated ? 'Yes' : 'No'}`, 
              `Cookies: ${cookies.map(c => c.name).join(', ')}`);
  
  // Check if the current path is an auth page (login/register)
  const isAuthPath = authRoutes.includes(request.nextUrl.pathname);
  
  console.log(`Path: ${request.nextUrl.pathname}, Auth: ${isAuthenticated}, AuthPath: ${isAuthPath}`);
  
  // If the user is not authenticated and tries to access any non-auth page (including root /),
  // redirect to the login page
  if (!isAuthenticated && !isAuthPath) {
    console.log('User not authenticated, redirecting to login');
    const redirectUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // If the user is authenticated and trying to access a login/register page,
  // redirect to the home page
  if (isAuthenticated && isAuthPath) {
    console.log('User already authenticated, redirecting to home');
    const redirectUrl = new URL('/', request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Otherwise, continue with the request
  return NextResponse.next();
}

// Specify which paths this middleware will run on
export const config = {
  matcher: [
    // Protect all routes except public assets
    '/((?!_next/static|_next/image|favicon\.ico|public).*)',
  ],
};
