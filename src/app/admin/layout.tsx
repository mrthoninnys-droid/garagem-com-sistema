'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentActiveStore } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const isPublicRoute = pathname === '/admin/login' || pathname === '/admin/register';
    const activeStore = getCurrentActiveStore();

    if (!isPublicRoute && !activeStore) {
      // Redirecionamento forçado para a tela de login
      window.location.href = '/admin/login';
    } else {
      setChecking(false);
    }
  }, [pathname]);

  const isPublicRoute = pathname === '/admin/login' || pathname === '/admin/register';

  // Tela de carregamento enquanto valida a sessão (evita tela branca)
  if (checking && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
        <Loader2 size={36} className="animate-spin text-neutral-900 mb-3" />
        <p className="text-sm font-bold text-neutral-800">Verificando autorização do estabelecimento...</p>
        <p className="text-xs text-neutral-500 mt-1">Redirecionando para o login...</p>
      </div>
    );
  }

  return <>{children}</>;
}