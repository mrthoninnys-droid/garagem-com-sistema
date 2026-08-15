'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Motorbike, CheckCircle, Clock, Truck } from 'lucide-react';
import Link from 'next/link';
import { getCurrentCashSession, ShiftOrder } from '@/lib/cash-register';

interface OrderWithDetails extends ShiftOrder {
  status: 'preparo' | 'pronto' | 'saiu' | 'entregue';
  motoboy?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [motoboyInputs, setMotoboyInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    const session = getCurrentCashSession();
    const savedDetails = localStorage.getItem('garagem_orders_details');
    let detailsMap: Record<string, { status: any; motoboy?: string }> = {};

    if (savedDetails) {
      try {
        detailsMap = JSON.parse(savedDetails);
      } catch (e) {
        console.error(e);
      }
    }

    const merged = session.orders.map((o) => ({
      ...o,
      status: detailsMap[o.id]?.status || 'preparo',
      motoboy: detailsMap[o.id]?.motoboy || '',
    }));

    setOrders(merged);
  }, []);

  const saveOrderDetails = (updated: OrderWithDetails[]) => {
    const detailsMap: Record<string, { status: string; motoboy?: string }> = {};
    updated.forEach((o) => {
      detailsMap[o.id] = { status: o.status, motoboy: o.motoboy };
    });
    localStorage.setItem('garagem_orders_details', JSON.stringify(detailsMap));
  };

  const handleUpdateStatus = (id: string, status: OrderWithDetails['status']) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
    setOrders(updated);
    saveOrderDetails(updated);
  };

  const handleAssignMotoboy = (id: string) => {
    const motoboyName = motoboyInputs[id];
    if (!motoboyName) return;

    const updated = orders.map((o) =>
      o.id === id ? { ...o, motoboy: motoboyName, status: 'saiu' as const } : o
    );
    setOrders(updated);
    saveOrderDetails(updated);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      <div className="bg-white border-b border-neutral-200 p-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-neutral-900">Gestão de Pedidos & Motoboys</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6 space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-xl text-center text-neutral-500 border border-neutral-200">
            Nenhum pedido registrado no caixa aberto no momento.
          </div>
        ) : (
          orders.map((ord) => (
            <div key={ord.id} className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-3 gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-neutral-900 text-white font-bold rounded-lg text-sm">
                    Pedido #{ord.orderNumber}
                  </span>
                  <div>
                    <h3 className="font-bold text-neutral-900">{ord.customerName}</h3>
                    <p className="text-xs text-neutral-500">{ord.createdAt} • Tel: {ord.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600 text-lg">R$ {ord.total.toFixed(2)}</span>
                  <span className="text-xs text-neutral-400 block uppercase font-medium">{ord.paymentMethod}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Atribuição de Motoboy */}
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
                  <label className="block text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                    <Truck size={16} /> Entregador / Motoboy Responsável:
                  </label>
                  {ord.motoboy ? (
                    <div className="flex items-center justify-between text-sm font-semibold text-blue-900 bg-blue-50 p-2 rounded border border-blue-200">
                      <span>Motoboy: {ord.motoboy}</span>
                      <button
                        onClick={() => {
                          const updated = orders.map((o) => (o.id === ord.id ? { ...o, motoboy: '' } : o));
                          setOrders(updated);
                          saveOrderDetails(updated);
                        }}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Trocar
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nome do Motoboy (ex: João)"
                        value={motoboyInputs[ord.id] || ''}
                        onChange={(e) => setMotoboyInputs({ ...motoboyInputs, [ord.id]: e.target.value })}
                        className="flex-1 p-2 border border-neutral-300 rounded text-xs bg-white"
                      />
                      <button
                        onClick={() => handleAssignMotoboy(ord.id)}
                        className="px-3 py-2 bg-neutral-900 text-white font-bold rounded text-xs hover:bg-neutral-800"
                      >
                        Despachar
                      </button>
                    </div>
                  )}
                </div>

                {/* Seletor de Status */}
                <div className="flex items-center gap-2 justify-start md:justify-end">
                  <button
                    onClick={() => handleUpdateStatus(ord.id, 'preparo')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                      ord.status === 'preparo' ? 'bg-amber-500 text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    Em Preparo
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(ord.id, 'saiu')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                      ord.status === 'saiu' ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    Saiu p/ Entrega
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(ord.id, 'entregue')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                      ord.status === 'entregue' ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    Entregue
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}