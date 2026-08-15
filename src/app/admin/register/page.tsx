'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Mail, KeyRound, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { registerNewStore } from '@/lib/auth';

export default function AdminRegisterPage() {
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerNewStore(storeName, email, password);

    if (result.success) {
      router.replace('/admin');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-md max-w-sm w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-neutral-900 text-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
            <Store size={24} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Cadastrar Loja</h1>
          <p className="text-xs text-neutral-500">Crie o acesso administrativo da sua loja</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Nome do Estabelecimento</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Ex: Garagem.Com - Unidade 1"
              className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">E-mail do Gestor</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="gestor@garagem.com"
                className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-semibold text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-neutral-900 text-white font-bold rounded-lg hover:bg-neutral-800 transition-colors text-sm shadow-sm"
          >
            Cadastrar e Entrar
          </button>
        </form>

        <div className="text-center border-t border-neutral-100 pt-4">
          <Link
            href="/admin/login"
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 inline-flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}