'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentActiveStore } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isPublicRoute = pathname === '/admin/login' || pathname === '/admin/register';
    const activeStore = getCurrentActiveStore();

    if (isPublicRoute) {
      setIsAllowed(true);
    } else if (activeStore) {
      setIsAllowed(true);
    } else {
      setIsAllowed(false);
      router.push('/admin/login');
    }
  }, [pathname, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
        <Loader2 size={36} className="animate-spin text-neutral-900 mb-3" />
        <p className="text-sm font-bold text-neutral-800">Carregando sistema...</p>
      </div>
    );
  }

  const isPublicRoute = pathname === '/admin/login' || pathname === '/admin/register';

  if (!isAllowed && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
        <Loader2 size={36} className="animate-spin text-neutral-900 mb-3" />
        <p className="text-sm font-bold text-neutral-800">Redirecionando para a tela de login...</p>
      </div>
    );
  }

  return <>{children}</>;
}