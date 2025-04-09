import { createClient } from '@supabase/supabase-js';
import { backupAuth } from './supabase-backup';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Flag to track if Supabase is available
let isSupabaseAvailable = true;

// Track connection status
let connectionChecked = false;

// Set a maximum retry count for Supabase connections
const MAX_RETRIES = 3;
let currentRetryCount = 0;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Authentication will not work properly.');
  isSupabaseAvailable = false;
}

// Function to check connectivity to Supabase
const checkSupabaseConnectivity = async () => {
  if (!navigator.onLine) {
    isSupabaseAvailable = false;
    return false;
  }
  
  try {
    if (!supabaseUrl) {
      console.error('Supabase URL is not defined');
      isSupabaseAvailable = false;
      return false;
    }

    // Use a more reliable approach - check if we can get the auth configuration
    const result = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey || '',
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    });

    isSupabaseAvailable = result.ok;
    if (!result.ok) {
      console.error('Supabase connection test failed:', await result.text());
    } else {
      console.log('Successfully connected to Supabase');
    }
    return result.ok;
  } catch (error) {
    console.error('Supabase connectivity check failed:', error);
    isSupabaseAvailable = false;
    return false;
  } finally {
    connectionChecked = true;
  }
};

// Create Supabase client with error handling
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials - cannot create client');
    isSupabaseAvailable = false;
    return null;
  }
  
  try {
    console.log('Initializing Supabase client with URL:', supabaseUrl);
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'supabase.auth.token',
        storage: {
          getItem: (key) => {
            try { return JSON.parse(localStorage.getItem(key) || 'null'); } 
            catch (e) { return null; }
          },
          setItem: (key, value) => {
            localStorage.setItem(key, JSON.stringify(value));
          },
          removeItem: (key) => {
            localStorage.removeItem(key);
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    isSupabaseAvailable = false;
    return null;
  }
};

// Initialize the Supabase client
export const supabase = createSupabaseClient() || ({} as any);

// Check connectivity on startup (non-blocking)
if (typeof window !== 'undefined') {
  const retryConnection = async () => {
    if (currentRetryCount >= MAX_RETRIES) return;
    
    const available = await checkSupabaseConnectivity();
    console.log(`Supabase connection attempt ${currentRetryCount + 1}/${MAX_RETRIES}:`, available ? 'Connected' : 'Failed');
    
    if (!available && currentRetryCount < MAX_RETRIES) {
      currentRetryCount++;
      console.log(`Retrying Supabase connection in 2 seconds...`);
      setTimeout(retryConnection, 2000);
    }
  };
  
  retryConnection();
}

export async function signUp(email: string, password: string) {
  // If we haven't checked connectivity yet, do it now
  if (!connectionChecked && typeof window !== 'undefined') {
    // Force a retry of connectivity check before signup
    for (let i = 0; i < 2; i++) {
      const available = await checkSupabaseConnectivity();
      if (available) break;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  try {
    // Check for internet connection
    if (!navigator.onLine) {
      return { 
        data: null, 
        error: { message: 'You are offline. Please check your internet connection.' } 
      };
    }
    
    // Use backup auth if Supabase is unavailable
    if (!isSupabaseAvailable) {
      console.log('Using backup authentication for signup');
      const response = await backupAuth.signUp(email, password);
      
      if (response.success) {
        return {
          data: {
            user: response.user,
            session: { user: response.user }
          },
          error: null
        };
      } else {
        return {
          data: null,
          error: { message: response.error || 'Registration failed' }
        };
      }
    }
    
    // Use Supabase if available
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    return { data, error };
  } catch (error) {
    console.error('Registration error:', error);
    
    // Try backup auth as fallback
    try {
      console.log('Falling back to backup authentication for signup');
      const response = await backupAuth.signUp(email, password);
      
      if (response.success) {
        return {
          data: {
            user: response.user,
            session: { user: response.user }
          },
          error: null
        };
      } else {
        return {
          data: null,
          error: { message: response.error || 'Registration failed' }
        };
      }
    } catch (backupError) {
      return { 
        data: null, 
        error: { 
          message: 'Registration failed. Please check your network connection and try again.' 
        } 
      };
    }
  }
}

export async function signIn(email: string, password: string) {
  // If we haven't checked connectivity yet, do it now
  if (!connectionChecked && typeof window !== 'undefined') {
    // Force a retry of connectivity check before signin
    for (let i = 0; i < 2; i++) {
      const available = await checkSupabaseConnectivity();
      if (available) break;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  try {
    // Check for internet connection
    if (!navigator.onLine) {
      return { 
        data: null, 
        error: { message: 'You are offline. Please check your internet connection.' } 
      };
    }
    
    // Use backup auth if Supabase is unavailable
    if (!isSupabaseAvailable) {
      console.log('Using backup authentication for login');
      const response = await backupAuth.signIn(email, password);
      
      if (response.success) {
        return {
          data: {
            user: response.user,
            session: { user: response.user }
          },
          error: null
        };
      } else {
        return {
          data: null,
          error: { message: response.error || 'Login failed' }
        };
      }
    }
    
    // Use Supabase if available
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  } catch (error) {
    console.error('Login error:', error);
    
    // Try backup auth as fallback
    try {
      console.log('Falling back to backup authentication for login');
      const response = await backupAuth.signIn(email, password);
      
      if (response.success) {
        return {
          data: {
            user: response.user,
            session: { user: response.user }
          },
          error: null
        };
      } else {
        return {
          data: null,
          error: { message: response.error || 'Login failed' }
        };
      }
    } catch (backupError) {
      return { 
        data: null, 
        error: { 
          message: 'Authentication failed. Please check your network connection and try again.' 
        } 
      };
    }
  }
}

export async function signOut() {
  // If we haven't checked connectivity yet, do it now
  if (!connectionChecked && typeof window !== 'undefined') {
    await checkSupabaseConnectivity();
  }
  
  try {
    // Use backup auth if Supabase is unavailable
    if (!isSupabaseAvailable) {
      console.log('Using backup authentication for signOut');
      const response = await backupAuth.signOut();
      return { error: response.success ? null : { message: response.error || 'Sign out failed' } };
    }
    
    // Use Supabase if available
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    // Try backup signout on failure
    await backupAuth.signOut();
    return { error: null };
  }
}

export async function getSession() {
  // If we haven't checked connectivity yet, do it now
  if (!connectionChecked && typeof window !== 'undefined') {
    await checkSupabaseConnectivity();
  }
  
  try {
    // Use backup auth if Supabase is unavailable
    if (!isSupabaseAvailable) {
      console.log('Using backup authentication for getSession');
      const response = await backupAuth.getSession();
      
      if (response.success && response.user) {
        return {
          data: {
            session: { user: response.user }
          },
          error: null
        };
      } else {
        return {
          data: { session: null },
          error: null
        };
      }
    }
    
    // Use Supabase if available
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  } catch (error) {
    console.error('Get session error:', error);
    
    // Try backup auth as fallback
    try {
      const response = await backupAuth.getSession();
      
      if (response.success && response.user) {
        return {
          data: {
            session: { user: response.user }
          },
          error: null
        };
      } else {
        return {
          data: { session: null },
          error: null
        };
      }
    } catch (backupError) {
      return { 
        data: { session: null }, 
        error: null
      };
    }
  }
}
