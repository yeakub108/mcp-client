"use client";

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait until auth state is loaded
    if (!loading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/auth/login');
      } else {
        setIsChecking(false);
      }
    }
  }, [user, loading, router]);

  // Show nothing while checking authentication
  if (loading || isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          <p className="text-gray-500">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Render children only if authenticated
  return <>{children}</>;
}
