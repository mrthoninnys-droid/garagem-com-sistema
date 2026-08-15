'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, CreditCard, Check } from 'lucide-react';
import Link from 'next/link';
import { StoreSettings, getStoreSettings, saveStoreSettings } from '@/lib/settings';

export default function AdminPaymentsPage() {
  const [settings, setSettings] = useState<StoreSettings>(getStoreSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getStoreSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoreSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      <div className="bg-white border-b border-neutral-200 p-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <CreditCard size={22} className="text-teal-600" /> Dados Bancários & PIX
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-6">
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
          <div className="space-y-4">
            <h2 className="font-bold text-neutral-900 text-sm border-b border-neutral-100 pb-2">
              Configurações do Chave PIX
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Tipo de Chave PIX</label>
                <select
                  value={settings.pixKeyType}
                  onChange={(e) => setSettings({ ...settings, pixKeyType: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm bg-white font-medium"
                >
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="E-mail">E-mail</option>
                  <option value="Telefone">Telefone</option>
                  <option value="Chave Aleatória">Chave Aleatória</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Chave PIX</label>
                <input
                  type="text"
                  required
                  value={settings.pixKey}
                  onChange={(e) => setSettings({ ...settings, pixKey: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Nome do Titular da Conta</label>
              <input
                type="text"
                required
                value={settings.accountHolder}
                onChange={(e) => setSettings({ ...settings, accountHolder: e.target.value })}
                className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Nome do Banco / Instituição</label>
              <input
                type="text"
                required
                value={settings.bankName}
                onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-neutral-900 text-white font-bold rounded-lg hover:bg-neutral-800 flex items-center justify-center gap-2"
          >
            {saved ? <Check size={18} /> : <Save size={18} />}
            {saved ? 'Dados Salvos!' : 'Salvar Dados Bancários'}
          </button>
        </form>
      </div>
    </div>
  );
}