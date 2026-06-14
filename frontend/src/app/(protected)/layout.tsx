"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      }
    }
  }, [isLoading, isAuthenticated, router, user, pathname]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-on-surface-variant">
        <div className="spinner" />
      </div>
    );
  }


  return <>{children}</>;
}
