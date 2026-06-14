"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, router, user]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-on-surface-variant">
        <div className="spinner" />
      </div>
    );
  }

  return <>{children}</>;
}
