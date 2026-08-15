'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Clock, CheckCircle, XCircle, Truck, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import { getCurrentCashSession, ShiftOrder } from '@/lib/cash-register';

interface OrderTrackingDetails extends ShiftOrder {
  status: 'preparo' | 'pronto' | 'saiu' | 'entregue' | 'cancelado';
  motoboy?: string;
}

export default function CustomerTrackPage() {
  const [phoneInput, setPhoneInput] = useState('');
  const [userOrders, setUserOrders] = useState<OrderTrackingDetails[]>([]);

  const handleSearch = () => {
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

    const cleanInput = phoneInput.replace(/\D/g, '');
    const found = session.orders
      .filter((o) => o.phone.replace(/\D/g, '').includes(cleanInput))
      .map((o) => ({
        ...o,
        status: detailsMap[o.id]?.status || 'preparo',
        motoboy: detailsMap[o.id]?.motoboy || '',
      }));

    setUserOrders(found);
  };

  const handleCancelByCustomer = (orderId: string) => {
    if (confirm('Deseja realmente cancelar este pedido?')) {
      const savedDetails = localStorage.getItem('garagem_orders_details');
      let detailsMap: Record<string, any> = savedDetails ? JSON.parse(savedDetails) : {};
      detailsMap[orderId] = { ...detailsMap[orderId], status: 'cancelado' };

      localStorage.setItem('garagem_orders_details', JSON.stringify(detailsMap));
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      <div className="bg-white border-b border-neutral-200 p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/customer" className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-neutral-900">Acompanhar Meus Pedidos</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3 shadow-sm">
          <label className="block text-xs font-bold text-neutral-700">Digite seu WhatsApp para buscar o pedido:</label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="(00) 00000-0000"
              className="flex-1 p-2.5 border border-neutral-300 rounded-lg text-sm"
            />
            <button
              onClick={handleSearch}
              className="px-5 py-2.5 bg-neutral-900 text-white font-bold rounded-lg text-sm hover:bg-neutral-800 flex items-center gap-2"
            >
              <Search size={16} /> Buscar
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {userOrders.map((ord) => (
            <div key={ord.id} className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-neutral-100 pb-3">
                <div>
                  <span className="px-3 py-1 bg-neutral-900 text-white font-bold rounded-lg text-xs">
                    Pedido #{ord.orderNumber}
                  </span>
                  <p className="text-xs text-neutral-500 mt-2">Realizado às: {ord.createdAt}</p>
                </div>
                <span className="font-bold text-emerald-600 text-base">R$ {ord.total.toFixed(2)}</span>
              </div>

              {/* Status do Pedido */}
              <div className="p-3 rounded-lg border flex items-center justify-between text-sm font-bold">
                {ord.status === 'preparo' && (
                  <span className="text-amber-600 flex items-center gap-2">
                    <Clock size={18} /> Em Preparação
                  </span>
                )}
                {ord.status === 'pronto' && (
                  <span className="text-blue-600 flex items-center gap-2">
                    <PackageCheck size={18} /> Pronto para Retirada
                  </span>
                )}
                {ord.status === 'saiu' && (
                  <span className="text-indigo-600 flex items-center gap-2">
                    <Truck size={18} /> Saiu para Entrega {ord.motoboy && `(Motoboy: ${ord.motoboy})`}
                  </span>
                )}
                {ord.status === 'entregue' && (
                  <span className="text-emerald-600 flex items-center gap-2">
                    <CheckCircle size={18} /> Entregue / Finalizado
                  </span>
                )}
                {ord.status === 'cancelado' && (
                  <span className="text-red-600 flex items-center gap-2">
                    <XCircle size={18} /> Pedido Cancelado
                  </span>
                )}

                {/* Opção de Cancelar pelo Cliente se estiver em preparo */}
                {ord.status === 'preparo' && (
                  <button
                    onClick={() => handleCancelByCustomer(ord.id)}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Cancelar Pedido
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}