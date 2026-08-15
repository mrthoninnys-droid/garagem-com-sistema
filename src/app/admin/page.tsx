'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
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
  Lock,
  Mail,
  KeyRound,
  Loader2,
} from 'lucide-react';
import {
  getCurrentActiveStore,
  loginStoreAccount,
  registerNewStore,
  logoutStoreAccount,
  StoreAccount,
} from '@/lib/auth';

function AdminDashboardContent() {
  const [activeStore, setActiveStore] = useState<StoreAccount | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Formulário de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Formulário de Cadastro
  const [regStoreName, setRegStoreName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  useEffect(() => {
    setActiveStore(getCurrentActiveStore());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = loginStoreAccount(loginEmail, loginPassword);
    if (res.success && res.store) {
      setActiveStore(res.store);
    } else {
      setLoginError(res.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    const res = registerNewStore(regStoreName, regEmail, regPassword);
    if (res.success && res.store) {
      setActiveStore(res.store);
    } else {
      setRegError(res.message);
    }
  };

  const handleLogout = () => {
    logoutStoreAccount();
    setActiveStore(null);
  };

  // TELA DE AUTENTICAÇÃO (Exibida se não houver loja logada)
  if (!activeStore) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-md max-w-sm w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-neutral-900 text-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
              {authMode === 'login' ? <Lock size={24} /> : <Store size={24} />}
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {authMode === 'login' ? 'Acesso Restrito' : 'Cadastrar Nova Loja'}
            </h1>
            <p className="text-xs text-neutral-500">
              {authMode === 'login'
                ? 'Entre com as credenciais da sua loja'
                : 'Crie o acesso administrativo do seu estabelecimento'}
            </p>
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">E-mail Cadastrado</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="loja@exemplo.com"
                    className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Senha</label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              {loginError && <p className="text-xs text-red-500 font-semibold text-center">{loginError}</p>}

              <button
                type="submit"
                className="w-full py-3 bg-neutral-900 text-white font-bold rounded-lg hover:bg-neutral-800 transition-colors text-sm shadow-sm"
              >
                Entrar no Painel
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Nome do Estabelecimento</label>
                <input
                  type="text"
                  required
                  value={regStoreName}
                  onChange={(e) => setRegStoreName(e.target.value)}
                  placeholder="Ex: Garagem.Com - Unidade 1"
                  className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">E-mail do Gestor</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="gestor@garagem.com"
                    className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Criar Senha de Acesso</label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              {regError && <p className="text-xs text-red-500 font-semibold text-center">{regError}</p>}

              <button
                type="submit"
                className="w-full py-3 bg-neutral-900 text-white font-bold rounded-lg hover:bg-neutral-800 transition-colors text-sm shadow-sm"
              >
                Cadastrar e Acessar
              </button>
            </form>
          )}

          <div className="text-center border-t border-neutral-100 pt-4">
            {authMode === 'login' ? (
              <>
                <p className="text-xs text-neutral-500">Ainda não cadastrou sua loja?</p>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-xs font-bold text-neutral-900 hover:underline inline-flex items-center gap-1 mt-1"
                >
                  <Store size={14} /> Cadastrar Nova Loja
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-xs font-bold text-neutral-900 hover:underline"
              >
                &larr; Voltar para a Tela de Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PAINEL DE GESTÃO (Exibido após o login)
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
      <div className="bg-white border-b border-neutral-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-900 text-white rounded-lg flex items-center justify-center">
              <Store size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-neutral-900">{activeStore.storeName}</h1>
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

// Desativa o SSR para eliminar completamente os erros de hidratação do React
export default dynamic(() => Promise.resolve(AdminDashboardContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4 text-center">
      <Loader2 size={36} className="animate-spin text-neutral-900 mb-3" />
      <p className="text-sm font-bold text-neutral-800">Carregando painel...</p>
    </div>
  ),
});