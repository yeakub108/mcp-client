// This is a backup service to use when Supabase connection fails

type User = {
  id: string;
  email: string;
};

type BackupAuthResponse = {
  success: boolean;
  user?: User | null;
  error?: string;
};

// Mock data store for local development/fallback
const mockUsers: Record<string, {email: string; password: string}> = {};
let currentUser: User | null = null;

export const backupAuth = {
  // Register a new user locally
  signUp: async (email: string, password: string): Promise<BackupAuthResponse> => {
    console.log('Using backup authentication service for signUp');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if user already exists
    if (mockUsers[email]) {
      return {
        success: false,
        error: 'User already exists'
      };
    }
    
    // Create new user
    const userId = `local-${Date.now()}`;
    mockUsers[email] = { email, password };
    
    // Automatically sign in
    currentUser = { id: userId, email };
    
    return {
      success: true,
      user: currentUser
    };
  },
  
  // Sign in user locally
  signIn: async (email: string, password: string): Promise<BackupAuthResponse> => {
    console.log('Using backup authentication service for signIn');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check credentials
    const user = mockUsers[email];
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    if (user.password !== password) {
      return {
        success: false,
        error: 'Invalid login credentials'
      };
    }
    
    // Set current user
    currentUser = { id: `local-${email}`, email };
    
    return {
      success: true,
      user: currentUser
    };
  },
  
  // Sign out user locally
  signOut: async (): Promise<BackupAuthResponse> => {
    console.log('Using backup authentication service for signOut');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    currentUser = null;
    
    return {
      success: true
    };
  },
  
  // Get current session
  getSession: async (): Promise<BackupAuthResponse> => {
    console.log('Using backup authentication service for getSession');
    
    return {
      success: true,
      user: currentUser
    };
  }
};
