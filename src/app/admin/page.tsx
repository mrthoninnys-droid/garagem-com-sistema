'use client';

import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  UtensilsCrossed,
  Truck,
  Award,
  Eye,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const adminModules = [
    {
      title: 'Controle de Caixa',
      desc: 'Abrir e fechar caixa diário, fundo de troco, relatórios de vendas e extrato por turno.',
      href: '/admin/cash-register',
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      title: 'Pedidos & Motoboys',
      desc: 'Acompanhar pedidos em tempo real, mudar etapas e atribuir cada entrega ao motoboy.',
      href: '/admin/orders',
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: 'Pausar Itens do Cardápio',
      desc: 'Pausar itens esgotados temporariamente para não aparecerem no menu do cliente.',
      href: '/admin/menu',
      icon: UtensilsCrossed,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      title: 'Taxas de Entrega',
      desc: 'Configurar e ajustar valores de frete por cidade, bairro ou faixa de CEP.',
      href: '/admin/delivery',
      icon: Truck,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      title: 'Programa de Fidelidade',
      desc: 'Gerenciar pontos acumulados, regras de recompensa e alterar pontos dos clientes.',
      href: '/admin/loyalty',
      icon: Award,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">
              Painel de Gestão - Garagem.Com
            </h1>
            <p className="text-xs text-neutral-500">
              Central de controle administrativo
            </p>
          </div>
          <Link
            href="/customer"
            target="_blank"
            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-lg text-xs flex items-center gap-2 transition-colors"
          >
            <Eye size={16} /> Ver Cardápio
          </Link>
        </div>
      </div>

      {/* Grid de Atalhos */}
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
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center border ${mod.color}`}
                  >
                    <Icon size={24} />
                  </div>
                  <h2 className="font-bold text-lg text-neutral-900">
                    {mod.title}
                  </h2>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {mod.desc}
                  </p>
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