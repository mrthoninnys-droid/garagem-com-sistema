'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { ChefHat, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface KDSOrder {
  id: string;
  items: Array<{ name: string; quantity: number; notes?: string }>;
  createdAt: string;
  estimatedTime: number;
  isPriority: boolean;
  status: 'PENDING' | 'PREPARING' | 'READY';
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<KDSOrder[]>([
    {
      id: '1',
      items: [
        { name: 'Pizza Mozzarella - Grande', quantity: 1, notes: 'Sem cebola' },
        { name: 'Hambúrguer Clássico', quantity: 2, notes: 'Bem passado, com bacon extra' },
      ],
      createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
      estimatedTime: 30,
      isPriority: false,
      status: 'PENDING',
    },
  ]);

  const [times, setTimes] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setTimes((prev) => {
        const updated: Record<string, number> = {};
        orders.forEach((order) => {
          const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000 / 60);
          updated[order.id] = elapsed;
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  const handleMarkReady = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'READY' } : o
      )
    );
  };

  const handleRemove = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const readyOrders = orders.filter((o) => o.status === 'READY');

  return (
    <Layout showNavigation={false}>
      <div className="min-h-screen bg-neutral-900">
        {/* Header */}
        <div className="bg-secondary text-white p-6 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat size={36} />
              <div>
                <h1 className="text-3xl font-bold">KDS - Cozinha</h1>
                <p className="text-secondary-200">Sistema de Exibição da Cozinha</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{pendingOrders.length} Pendentes</p>
              <p className="text-sm text-secondary-200">{readyOrders.length} Prontos</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Pedidos em Preparo */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <AlertCircle size={32} className="text-warning" />
                PREPARANDO
              </h2>

              {pendingOrders.length === 0 ? (
                <div className="text-center bg-neutral-800 rounded-lg p-12">
                  <p className="text-3xl text-neutral-500">✓ Tudo em dia!</p>
                  <p className="text-neutral-400 mt-2">Nenhum pedido pendente</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`rounded-lg p-6 border-4 flex flex-col justify-between min-h-96 ${
                        order.isPriority
                          ? 'bg-danger/20 border-danger shadow-lg shadow-danger/50'
                          : 'bg-primary/20 border-primary'
                      }`}
                    >
                      {/* Order Number */}
                      <div>
                        <p className="text-neutral-400 text-sm mb-2">PEDIDO #</p>
                        <p className="text-6xl font-bold text-white">{order.id}</p>

                        {/* Items */}
                        <div className="mt-8 space-y-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="bg-black/30 rounded-lg p-4">
                              <p className="text-3xl font-bold text-white">
                                {item.quantity}x <span className="text-primary">{item.name}</span>
                              </p>
                              {item.notes && (
                                <p className="text-lg text-warning mt-2 italic">⚠️ {item.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Timer */}
                      <div className="mt-8 pt-6 border-t border-white/20">
                        <p className="text-neutral-300 text-sm mb-2">TEMPO</p>
                        <div className="flex items-center justify-between">
                          <p className="text-5xl font-bold text-white">
                            {times[order.id] || 0}
                            <span className="text-2xl ml-2">min</span>
                          </p>
                          <button
                            onClick={() => handleMarkReady(order.id)}
                            className="bg-success text-white px-6 py-3 rounded-lg font-bold text-xl hover:bg-success/90 transition-colors"
                          >
                            PRONTO
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pedidos Prontos */}
            {readyOrders.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-success mb-6 flex items-center gap-2">
                  <CheckCircle size={32} />
                  PRONTOS
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {readyOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-success/20 border-4 border-success rounded-lg p-6 flex flex-col justify-between min-h-96"
                    >
                      <div>
                        <p className="text-neutral-400 text-sm mb-2">PEDIDO #</p>
                        <p className="text-6xl font-bold text-success">{order.id}</p>

                        <div className="mt-8 space-y-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="bg-black/30 rounded-lg p-4">
                              <p className="text-2xl font-bold text-success">
                                ✓ {item.quantity}x {item.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-white/20">
                        <button
                          onClick={() => handleRemove(order.id)}
                          className="w-full bg-neutral-700 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-neutral-600 transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
