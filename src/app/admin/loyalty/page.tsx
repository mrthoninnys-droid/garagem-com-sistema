'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Check, Award, Users, Search, Edit2 } from 'lucide-react';
import Link from 'next/link';
import {
  LoyaltySettings,
  CustomerLoyalty,
  getLoyaltySettings,
  saveLoyaltySettings,
  getAllCustomersLoyalty,
  updateCustomerPoints,
} from '@/lib/loyalty';

export default function AdminLoyaltyPage() {
  const [settings, setSettings] = useState<LoyaltySettings>({
    pointsPerReal: 1,
    pointsToRedeem: 50,
    rewardDiscount: 10,
  });
  const [customers, setCustomers] = useState<CustomerLoyalty[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [editingPhone, setEditingPhone] = useState<string | null>(null);
  const [tempPoints, setTempPoints] = useState<number>(0);

  useEffect(() => {
    setSettings(getLoyaltySettings());
    setCustomers(getAllCustomersLoyalty());
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveLoyaltySettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveCustomerPoints = (phone: string) => {
    updateCustomerPoints(phone, tempPoints);
    setCustomers(getAllCustomersLoyalty());
    setEditingPhone(null);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Award className="text-amber-500" size={24} /> Programa de Fidelidade
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* Formulário de Configuração das Regras */}
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <h2 className="font-bold text-lg text-neutral-900">Configuração de Regras</h2>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-sm text-sm"
            >
              {savedSuccess ? <Check size={16} /> : <Save size={16} />}
              {savedSuccess ? 'Regras Salvas!' : 'Salvar Regras'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Pontos por R$ 1,00 Gasto
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={settings.pointsPerReal}
                onChange={(e) => setSettings({ ...settings, pointsPerReal: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">Ex: 1 = R$ 1,00 dá 1 ponto</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Pontos Necessários para Resgate
              </label>
              <input
                type="number"
                required
                value={settings.pointsToRedeem}
                onChange={(e) => setSettings({ ...settings, pointsToRedeem: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">Ex: 50 pontos acumulados</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Valor do Desconto Resgatado (R$)
              </label>
              <input
                type="number"
                step="0.50"
                required
                value={settings.rewardDiscount}
                onChange={(e) => setSettings({ ...settings, rewardDiscount: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">Ex: R$ 10,00 de desconto</span>
            </div>
          </div>
        </form>

        {/* Gerenciamento de Clientes e Pontuações */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
            <h2 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
              <Users size={20} /> Clientes Cadastrados ({customers.length})
            </h2>

            {/* Busca */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-neutral-400" size={16} />
              <input
                type="text"
                placeholder="Buscar cliente ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-neutral-300 rounded-lg text-sm focus:outline-none"
              />
            </div>
          </div>

          {filteredCustomers.length === 0 ? (
            <p className="text-center text-neutral-500 py-8 text-sm">
              Nenhum cliente cadastrado ainda. Os clientes serão salvos automaticamente ao realizarem um pedido.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.phone}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-neutral-200 rounded-lg bg-neutral-50/50 gap-4"
                >
                  <div>
                    <h4 className="font-bold text-neutral-900">{customer.name}</h4>
                    <p className="text-xs text-neutral-500">
                      Tel: <span className="font-medium text-neutral-700">{customer.phone}</span> • {customer.ordersCount} pedidos realizados
                    </p>
                    <p className="text-xs text-neutral-500">
                      Total gasto no estabelecimento: <span className="font-medium text-emerald-600">R$ {customer.totalSpent.toFixed(2)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {editingPhone === customer.phone ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={tempPoints}
                          onChange={(e) => setTempPoints(parseInt(e.target.value) || 0)}
                          className="w-20 p-1.5 border border-neutral-300 rounded text-sm font-bold bg-white"
                        />
                        <button
                          onClick={() => handleSaveCustomerPoints(customer.phone)}
                          className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded text-xs"
                        >
                          Salvar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-xs flex items-center gap-1">
                          <Award size={14} /> {customer.points} Pontos
                        </span>
                        <button
                          onClick={() => {
                            setEditingPhone(customer.phone);
                            setTempPoints(customer.points);
                          }}
                          className="p-1.5 text-neutral-500 hover:bg-neutral-200 rounded"
                          title="Alterar Pontuação"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}