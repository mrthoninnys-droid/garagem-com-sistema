'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, UserCheck, FileText } from 'lucide-react';
import Link from 'next/link';
import { Motoboy, getMotoboys, saveMotoboys } from '@/lib/motoboys';
import { getCurrentCashSession } from '@/lib/cash-register';

export default function AdminMotoboysPage() {
  const [motoboys, setMotoboysList] = useState<Motoboy[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('Moto');
  const [deliveryFeeRate, setDeliveryFeeRate] = useState('5.00');

  useEffect(() => {
    setMotoboysList(getMotoboys());
  }, []);

  const handleAddMotoboy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newMotoboy: Motoboy = {
      id: Date.now().toString(),
      name,
      phone,
      vehicle,
      deliveryFeeRate: parseFloat(deliveryFeeRate) || 0,
    };

    const updated = [...motoboys, newMotoboy];
    setMotoboysList(updated);
    saveMotoboys(updated);

    setName('');
    setPhone('');
  };

  const handleRemoveMotoboy = (id: string) => {
    const updated = motoboys.filter((m) => m.id !== id);
    setMotoboysList(updated);
    saveMotoboys(updated);
  };

  // Cálculo do Relatório de Entregas do Caixa Aberto
  const session = getCurrentCashSession();
  const savedDetails = localStorage.getItem('garagem_orders_details');
  let detailsMap: Record<string, { motoboy?: string }> = {};

  if (savedDetails) {
    try {
      detailsMap = JSON.parse(savedDetails);
    } catch (e) {
      console.error(e);
    }
  }

  const deliveryReport = motoboys.map((mb) => {
    const assignedOrders = session.orders.filter(
      (o) => detailsMap[o.id]?.motoboy?.toLowerCase() === mb.name.toLowerCase()
    );
    const totalDeliveries = assignedOrders.length;
    const totalPayable = totalDeliveries * mb.deliveryFeeRate;

    return {
      motoboy: mb,
      totalDeliveries,
      totalPayable,
    };
  });

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      <div className="bg-white border-b border-neutral-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <UserCheck size={22} className="text-indigo-600" /> Motoboys & Relatório de Entregas
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* Relatório de Comissões do Turno */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <h2 className="font-bold text-lg text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
            <FileText size={20} className="text-indigo-600" /> Relatório de Fechamento do Turno
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliveryReport.map((rep) => (
              <div key={rep.motoboy.id} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-neutral-900">{rep.motoboy.name}</span>
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                    {rep.motoboy.vehicle}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-neutral-600">
                  <span>Entregas Realizadas:</span>
                  <span className="font-bold text-neutral-900">{rep.totalDeliveries} corridas</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-neutral-900 border-t border-indigo-100 pt-2">
                  <span>Valor a Pagar:</span>
                  <span className="text-indigo-700">R$ {rep.totalPayable.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cadastrar Motoboy */}
        <form onSubmit={handleAddMotoboy} className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <h2 className="font-bold text-lg text-neutral-900 border-b border-neutral-100 pb-3">Cadastrar Entregador</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Nome do Motoboy</label>
              <input
                type="text"
                required
                placeholder="Ex: Carlos Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Telefone / WhatsApp</label>
              <input
                type="tel"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Veículo</label>
              <input
                type="text"
                placeholder="Ex: CG 160 Fan - Placa XXX-0000"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Taxa Paga por Entrega (R$)</label>
              <input
                type="number"
                step="0.50"
                required
                value={deliveryFeeRate}
                onChange={(e) => setDeliveryFeeRate(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg text-sm font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-neutral-900 text-white font-bold rounded-lg hover:bg-neutral-800 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Cadastrar Motoboy
          </button>
        </form>

        {/* Lista de Motoboys */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <h2 className="font-bold text-lg text-neutral-900 border-b border-neutral-100 pb-3">Entregadores Ativos</h2>

          <div className="space-y-3">
            {motoboys.map((mb) => (
              <div key={mb.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                <div>
                  <span className="font-bold text-neutral-900 block">{mb.name}</span>
                  <span className="text-xs text-neutral-500">
                    Tel: {mb.phone || 'Não informado'} • Veículo: {mb.vehicle}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 block mt-1">
                    R$ {mb.deliveryFeeRate.toFixed(2)} por entrega
                  </span>
                </div>

                <button
                  onClick={() => handleRemoveMotoboy(mb.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}