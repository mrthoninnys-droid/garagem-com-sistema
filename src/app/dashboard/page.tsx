'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { LayoutDashboard, Bell, Clock, User, Phone, MapPin, DollarSign, AlertCircle, CheckCircle, Truck, Trash2, Edit2 } from 'lucide-react';
import { formatCurrency, formatDateTime, formatPhone } from '@/lib/utils';

interface KanbanOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  total: number;
  status: string;
  items: string;
  createdAt: string;
  estimatedTime: number;
  orderType: string;
  paymentMethod: string;
}

const STATUS_COLUMNS = {
  PENDING: { label: 'Novos Pedidos', color: 'border-warning', bgColor: 'bg-warning/5' },
  CONFIRMED: { label: 'Confirmados', color: 'border-info', bgColor: 'bg-info/5' },
  PREPARING: { label: 'Em Preparo', color: 'border-primary', bgColor: 'bg-primary/5' },
  READY: { label: 'Pronto', color: 'border-success', bgColor: 'bg-success/5' },
  SHIPPED: { label: 'Saiu p/ Entrega', color: 'border-secondary', bgColor: 'bg-secondary/5' },
  DELIVERED: { label: 'Entregue', color: 'border-success', bgColor: 'bg-success/5' },
  CANCELLED: { label: 'Cancelados', color: 'border-danger', bgColor: 'bg-danger/5' },
};

export default function DashboardPage() {
  const [orders, setOrders] = useState<Record<string, KanbanOrder[]>>({
    PENDING: [
      {
        id: '1',
        customerName: 'João Silva',
        customerPhone: '11999999999',
        total: 102.0,
        status: 'PENDING',
        items: '1x Pizza Mozzarella (Grande), 2x Hambúrguer',
        createdAt: new Date().toISOString(),
        estimatedTime: 30,
        orderType: 'DELIVERY',
        paymentMethod: 'PIX',
      },
    ],
    CONFIRMED: [],
    PREPARING: [],
    READY: [],
    SHIPPED: [],
    DELIVERED: [],
    CANCELLED: [],
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<KanbanOrder | null>(null);

  const handleStatusChange = (orderId: string, fromStatus: string, toStatus: string) => {
    setOrders((prev) => {
      const newOrders = { ...prev };
      const orderIndex = newOrders[fromStatus].findIndex((o) => o.id === orderId);
      if (orderIndex >= 0) {
        const order = newOrders[fromStatus][orderIndex];
        order.status = toStatus;
        newOrders[toStatus] = [...(newOrders[toStatus] || []), order];
        newOrders[fromStatus] = newOrders[fromStatus].filter((_, i) => i !== orderIndex);
      }
      return newOrders;
    });

    if (soundEnabled) {
      playNotificationSound();
    }
  };

  const playNotificationSound = () => {
    // Simular som de notificação
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.frequency.value = 1000;
    oscillator.type = 'sine';

    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Pedidos', href: '/dashboard/orders', icon: <Bell size={20} /> },
    { label: 'Cozinha (KDS)', href: '/kitchen', icon: <Truck size={20} /> },
    { label: 'Configurações', href: '/admin/settings', icon: <AlertCircle size={20} /> },
  ];

  const totalOrders = Object.values(orders).reduce((sum, arr) => sum + arr.length, 0);
  const pendingOrders = orders.PENDING.length;
  const preparingOrders = orders.PREPARING.length;

  return (
    <Layout title="PDV Dashboard" showNavigation={true} navItems={navItems}>
      {/* Top Stats */}
      <div className="bg-white border-b border-neutral-200 p-6 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-neutral-900">Quadro de Pedidos</h2>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                soundEnabled
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
              }`}
            >
              <Bell size={18} />
              {soundEnabled ? 'Som Ativado' : 'Som Desativado'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-warning/20 to-warning/10 border border-warning/50 rounded-lg p-4">
              <p className="text-warning font-semibold text-sm">Pedidos Pendentes</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{pendingOrders}</p>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/50 rounded-lg p-4">
              <p className="text-primary font-semibold text-sm">Em Preparo</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{preparingOrders}</p>
            </div>
            <div className="bg-gradient-to-br from-success/20 to-success/10 border border-success/50 rounded-lg p-4">
              <p className="text-success font-semibold text-sm">Total de Pedidos</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{totalOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-6">
        <div className="max-w-full overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {Object.entries(STATUS_COLUMNS).map(([status, config]) => (
              <div key={status} className="w-96 flex-shrink-0">
                {/* Column Header */}
                <div
                  className={`border-2 ${config.color} rounded-t-lg ${config.bgColor} p-4 flex items-center justify-between`}
                >
                  <h3 className="font-bold text-neutral-900">{config.label}</h3>
                  <span className="bg-white text-neutral-900 font-semibold px-3 py-1 rounded-full text-sm">
                    {orders[status as keyof typeof orders]?.length || 0}
                  </span>
                </div>

                {/* Cards */}
                <div className={`border-l-2 border-r-2 border-b-2 ${config.color} ${config.bgColor} min-h-96 p-4 space-y-3 rounded-b-lg`}>
                  {orders[status as keyof typeof orders]?.length === 0 ? (
                    <p className="text-center text-neutral-500 py-12">Nenhum pedido</p>
                  ) : (
                    orders[status as keyof typeof orders]?.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-bold text-neutral-900">{order.customerName}</p>
                            <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                              <Phone size={12} /> {formatPhone(order.customerPhone)}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-primary">#{order.id}</span>
                        </div>

                        {/* Type & Payment */}
                        <div className="flex gap-2 mb-3">
                          <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">
                            {order.orderType === 'DELIVERY' ? '🚗 Entrega' : '🏪 Retirada'}
                          </span>
                          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                            {order.paymentMethod}
                          </span>
                        </div>

                        {/* Items */}
                        <p className="text-sm text-neutral-600 line-clamp-2 mb-3 bg-neutral-50 p-2 rounded">
                          {order.items}
                        </p>

                        {/* Timer & Total */}
                        <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                          <div className="flex items-center gap-1 text-sm text-warning font-semibold">
                            <Clock size={14} />
                            {order.estimatedTime} min
                          </div>
                          <p className="text-sm font-bold text-neutral-900">
                            {formatCurrency(order.total)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          {status !== 'CANCELLED' && status !== 'DELIVERED' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextStatus = getNextStatus(status);
                                if (nextStatus) {
                                  handleStatusChange(order.id, status, nextStatus);
                                }
                              }}
                              className="flex-1 bg-primary text-white text-xs font-semibold py-2 rounded hover:bg-primary/90 transition-colors"
                            >
                              Próximo Status
                            </button>
                          )}
                          {status === 'PENDING' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(order.id, status, 'CANCELLED');
                              }}
                              className="px-3 bg-danger/10 text-danger text-xs font-semibold py-2 rounded hover:bg-danger/20 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900">Detalhes do Pedido #{selectedOrder.id}</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-neutral-600 text-sm">Cliente</p>
                  <p className="font-semibold text-neutral-900">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-neutral-600 text-sm">Telefone</p>
                  <p className="font-semibold text-neutral-900">{formatPhone(selectedOrder.customerPhone)}</p>
                </div>
                <div>
                  <p className="text-neutral-600 text-sm">Total</p>
                  <p className="font-bold text-primary text-lg">{formatCurrency(selectedOrder.total)}</p>
                </div>
                <div>
                  <p className="text-neutral-600 text-sm">Forma de Pagamento</p>
                  <p className="font-semibold text-neutral-900">{selectedOrder.paymentMethod}</p>
                </div>
              </div>

              <div className="bg-neutral-50 p-4 rounded-lg">
                <p className="text-neutral-600 text-sm mb-2">Itens</p>
                <p className="text-neutral-900">{selectedOrder.items}</p>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 flex gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 px-4 py-2 bg-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-300 transition-colors font-semibold"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  // Imprimir
                  window.print();
                }}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              >
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function getNextStatus(current: string): string | null {
  const order: Record<string, string> = {
    PENDING: 'CONFIRMED',
    CONFIRMED: 'PREPARING',
    PREPARING: 'READY',
    READY: 'SHIPPED',
    SHIPPED: 'DELIVERED',
  };
  return order[current] || null;
}
