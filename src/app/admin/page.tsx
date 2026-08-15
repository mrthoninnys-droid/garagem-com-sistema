'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  ShoppingBag,
  UtensilsCrossed,
  Truck,
  Award,
  Clock,
  CreditCard,
  UserCheck,
  LogOut,
  Eye,
  Store,
  Loader2,
} from 'lucide-react';
import { getCurrentActiveStore, logoutStoreAccount, StoreAccount } from '@/lib/auth';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeStore, setActiveStore] = useState<StoreAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const store = getCurrentActiveStore();
    if (!store) {
      // Se não houver loja ativa logada, bloqueia a tela e redireciona na hora
      router.replace('/admin/login');
    } else {
      setActiveStore(store);
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    logoutStoreAccount();
    router.replace('/admin/login');
  };

  // Enquanto verifica o login, exibe a tela de carregamento e esconde todo o painel
  if (loading || !activeStore) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
        <Loader2 size={32} className="animate-spin text-neutral-800 mb-2" />
        <p className="text-xs font-semibold text-neutral-600">Verificando acesso da loja...</p>
      </div>
    );
  }

  const adminModules = [
    {
      title: 'Controle de Caixa',
      desc: 'Abrir/fechar caixa diário, fundo de troco e extrato de vendas.',
      href: '/admin/cash-register',
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      title: 'Pedidos & Despacho',
      desc: 'Gerenciar etapas, cancelar pedidos e atribuir motoboys.',
      href: '/admin/orders',
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: 'Horário & Status da Loja',
      desc: 'Definir horário de funcionamento e alternar Aberto/Fechado.',
      href: '/admin/hours',
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      title: 'Gerenciar Cardápio',
      desc: 'Cadastrar novos produtos, alterar preços e remover itens.',
      href: '/admin/menu-crud',
      icon: UtensilsCrossed,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
    },
    {
      title: 'Cadastrar Motoboys & Relatórios',
      desc: 'Gerenciar entregadores e calcular comissões do turno.',
      href: '/admin/motoboys',
      icon: UserCheck,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      title: 'Dados Bancários & Pagamentos',
      desc: 'Configurar chave PIX e dados bancários para pagamentos.',
      href: '/admin/payments',
      icon: CreditCard,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
    },
    {
      title: 'Taxas de Entrega',
      desc: 'Configurar e ajustar valores de frete por cidade/CEP.',
      href: '/admin/delivery',
      icon: Truck,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      title: 'Programa de Fidelidade',
      desc: 'Gerenciar pontos e regras de desconto dos clientes.',
      href: '/admin/loyalty',
      icon: Award,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      {/* Header com dados da loja conectada */}
      <div className="bg-white border-b border-neutral-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-900 text-white rounded-lg flex items-center justify-center">
              <Store size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-neutral-900">
                {activeStore.storeName}
              </h1>
              <p className="text-xs text-neutral-500">{activeStore.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/customer"
              target="_blank"
              className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-lg text-xs flex items-center gap-2 transition-colors"
            >
              <Eye size={16} /> Cardápio
            </Link>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors border border-red-200"
            >
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Módulos */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className="bg-white p-6 rounded-xl border border-neutral-200 hover:border-neutral-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${mod.color}`}>
                    <Icon size={24} />
                  </div>
                  <h2 className="font-bold text-lg text-neutral-900">{mod.title}</h2>
                  <p className="text-xs text-neutral-500 leading-relaxed">{mod.desc}</p>
                </div>
                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1">
                  Acessar Módulo &rarr;
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}