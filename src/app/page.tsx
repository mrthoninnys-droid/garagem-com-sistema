import Image from 'next/image';

import Link from 'next/link';
import { ShoppingCart, LayoutDashboard, ChefHat, BarChart3, Settings } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-neutral-50 to-secondary/10">
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold text-neutral-900 flex items-center gap-3">
  <Image src="/garagem.png" alt="Logo Garagem.com" width={80} height={80} />
  <span className="text-primary">Garagem</span>
  <span className="text-secondary">.com</span>
</h1>
          <p className="text-neutral-600 mt-2">
            Sistema de Gestão e PDV para Restaurantes & Delivery
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Menu Digital */}
          <Link href="/customer">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-8 cursor-pointer border-2 border-neutral-100 hover:border-primary">
              <div className="text-primary mb-4">
                <ShoppingCart size={48} />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Menu Digital</h2>
              <p className="text-neutral-600">
                Cardápio digital para clientes. Visualizar produtos, fazer pedidos e acompanhar status.
              </p>
              <span className="inline-block mt-4 text-primary font-semibold">
                Acessar →
              </span>
            </div>
          </Link>

          {/* PDV Dashboard */}
          <Link href="/dashboard">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-8 cursor-pointer border-2 border-neutral-100 hover:border-secondary">
              <div className="text-secondary mb-4">
                <LayoutDashboard size={48} />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">PDV Dashboard</h2>
              <p className="text-neutral-600">
                Painel de atendimento com Kanban de pedidos, gerenciamento e impressão.
              </p>
              <span className="inline-block mt-4 text-secondary font-semibold">
                Acessar →
              </span>
            </div>
          </Link>

          {/* KDS - Kitchen Display */}
          <Link href="/kitchen">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-8 cursor-pointer border-2 border-neutral-100 hover:border-success">
              <div className="text-success mb-4">
                <ChefHat size={48} />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">KDS - Cozinha</h2>
              <p className="text-neutral-600">
                Tela simplificada para a cozinha com fonte grande e timer dos pedidos.
              </p>
              <span className="inline-block mt-4 text-success font-semibold">
                Acessar →
              </span>
            </div>
          </Link>

          {/* Admin Dashboard */}
          <Link href="/admin">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-8 cursor-pointer border-2 border-neutral-100 hover:border-warning">
              <div className="text-warning mb-4">
                <BarChart3 size={48} />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Admin & Relatórios</h2>
              <p className="text-neutral-600">
                Painel administrativo com relatórios financeiros e análises de vendas.
              </p>
              <span className="inline-block mt-4 text-warning font-semibold">
                Acessar →
              </span>
            </div>
          </Link>

          {/* Configurações */}
          <Link href="/admin/settings">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-8 cursor-pointer border-2 border-neutral-100 hover:border-danger">
              <div className="text-danger mb-4">
                <Settings size={48} />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Configurações</h2>
              <p className="text-neutral-600">
                Gerenciar produtos, categorias, taxas de entrega e horário de funcionamento.
              </p>
              <span className="inline-block mt-4 text-danger font-semibold">
                Acessar →
              </span>
            </div>
          </Link>
        </div>
      </main>

      <footer className="bg-neutral-900 text-neutral-200 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>
            &copy; 2024 Garagem.Com - Sistema de Gestão para Restaurantes. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
