'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentActiveStore } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const isPublicAdminRoute = pathname === '/admin/login' || pathname === '/admin/register';
    const activeStore = getCurrentActiveStore();

    if (isPublicAdminRoute) {
      setAuthorized(true);
      setLoading(false);
      return;
    }

    if (!activeStore) {
      setAuthorized(false);
      setLoading(false);
      router.replace('/admin/login');
    } else {
      setAuthorized(true);
      setLoading(false);
    }
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
        <Loader2 size={32} className="animate-spin text-neutral-800 mb-2" />
        <p className="text-xs font-semibold text-neutral-600">Verificando autorização de acesso...</p>
      </div>
    );
  }

  if (!authorized && pathname !== '/admin/login' && pathname !== '/admin/register') {
    return null;
  }

  return <>{children}</>;
}