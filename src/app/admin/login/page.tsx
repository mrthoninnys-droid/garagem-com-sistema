'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, KeyRound } from 'lucide-react';
import { loginAdmin } from '@/lib/auth';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(password)) {
      router.push('/admin');
    } else {
      setError('Senha incorreta. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-md max-w-sm w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-neutral-900 text-white rounded-xl flex items-center justify-center mx-auto">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Acesso Restrito</h1>
          <p className="text-xs text-neutral-500">Painel Administrativo Garagem.Com</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Senha de Acesso</label>
            <div className="relative">
              <KeyRound size={18} className="absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-neutral-900 text-white font-bold rounded-lg hover:bg-neutral-800 transition-colors text-sm"
          >
            Entrar no Painel
          </button>
        </form>
      </div>
    </div>
  );
}