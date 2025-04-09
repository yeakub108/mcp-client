/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/supabase-browser";

type User = {
  id: string;
  email?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (data.session?.user) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      setUser(null);
    }
  };

  // Sign in function
  const handleSignIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        data: null,
        error: { message: error.message || "Authentication failed" },
      };
    }
  };

  // Sign up function
  const handleSignUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error("Registration error:", error);
      return {
        data: null,
        error: { message: error.message || "Registration failed" },
      };
    }
  };

  // Sign out function
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      router.push("/auth/login");
      return { error: null };
    } catch (error: any) {
      console.error("Sign out error:", error);
      return { error };
    }
  };

  useEffect(() => {
    // Check for active session on initial load
    const initAuth = async () => {
      setLoading(true);
      await refreshSession();
      setLoading(false);
    };

    initAuth();

    // Listen for auth state changes
    const { data } = supabase.auth.onAuthStateChange(
      (
        event:
          | "SIGNED_IN"
          | "SIGNED_OUT"
          | "TOKEN_REFRESHED"
          | "USER_UPDATED"
          | "PASSWORD_RECOVERY",
        session: any
      ) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
