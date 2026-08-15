'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getCurrentActiveStore } from '@/lib/auth';
import { Loader2, Lock } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [activeStore, setActiveStore] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    setActiveStore(getCurrentActiveStore());
  }, [pathname]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
        <Loader2 size={32} className="animate-spin text-neutral-800 mb-2" />
        <p className="text-xs font-semibold text-neutral-600">Carregando sistema...</p>
      </div>
    );
  }

  // Se tentar acessar um submódulo diretamente sem login (ex: /admin/orders)
  if (pathname !== '/admin' && !activeStore) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-md max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 bg-neutral-900 text-white rounded-xl flex items-center justify-center mx-auto">
            <Lock size={24} />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">Acesso Restrito</h2>
          <p className="text-xs text-neutral-500">Faça login com a sua loja para acessar este módulo.</p>
          <a
            href="/admin"
            className="block w-full py-3 bg-neutral-900 text-white font-bold rounded-lg text-sm hover:bg-neutral-800 transition-colors"
          >
            Ir para a Tela de Login
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}