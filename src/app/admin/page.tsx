'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MetricCard {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

export default function AdminPage() {
  const [period, setPeriod] = useState('today');

  const metrics: MetricCard[] = [
    {
      label: 'Faturamento',
      value: formatCurrency(2450.50),
      change: '+12% vs semana anterior',
      icon: <DollarSign size={24} />,
      color: 'text-success',
    },
    {
      label: 'Pedidos',
      value: '24',
      change: '+5% vs semana anterior',
      icon: <ShoppingCart size={24} />,
      color: 'text-primary',
    },
    {
      label: 'Clientes',
      value: '18',
      change: '+2 novos clientes',
      icon: <Users size={24} />,
      color: 'text-secondary',
    },
    {
      label: 'Produtos Vendidos',
      value: '67',
      change: '+8% vs semana anterior',
      icon: <Package size={24} />,
      color: 'text-warning',
    },
  ];

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: <BarChart3 size={20} /> },
    { label: 'Configurações', href: '/admin/settings', icon: <Package size={20} /> },
    { label: 'PDV', href: '/dashboard', icon: <ShoppingCart size={20} /> },
  ];

  return (
    <Layout title="Relatórios & Análises" showNavigation={true} navItems={navItems}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Period Selector */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'today', label: 'Hoje' },
            { id: 'week', label: 'Esta Semana' },
            { id: 'month', label: 'Este Mês' },
            { id: 'year', label: 'Este Ano' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPeriod(opt.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === opt.id
                  ? 'bg-primary text-white'
                  : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.color} bg-opacity-10`}>
                  <div className={metric.color}>{metric.icon}</div>
                </div>
                <span className="text-success text-sm font-semibold">{metric.change}</span>
              </div>
              <p className="text-neutral-600 text-sm mb-1">{metric.label}</p>
              <p className="text-3xl font-bold text-neutral-900">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Faturamento por Dia */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-neutral-900 mb-6">Faturamento por Dia (Esta Semana)</h3>
            <div className="space-y-4">
              {[
                { day: 'Seg', value: 450, max: 500 },
                { day: 'Ter', value: 520, max: 500 },
                { day: 'Qua', value: 480, max: 500 },
                { day: 'Qui', value: 600, max: 600 },
                { day: 'Sex', value: 750, max: 800 },
                { day: 'Sab', value: 850, max: 900 },
                { day: 'Dom', value: 900, max: 1000 },
              ].map((item) => (
                <div key={item.day}>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-neutral-900">{item.day}</span>
                    <span className="text-primary font-bold">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="bg-neutral-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-primary h-full"
                      style={{ width: `${(item.value / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formas de Pagamento */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-neutral-900 mb-6">Formas de Pagamento</h3>
            <div className="space-y-4">
              {[
                { method: 'PIX', amount: 1200.50, percentage: 45 },
                { method: 'Cartão Crédito', amount: 850.00, percentage: 32 },
                { method: 'Dinheiro', amount: 400.00, percentage: 15 },
                { method: 'Cartão Débito', amount: 200.00, percentage: 8 },
              ].map((item) => (
                <div key={item.method}>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-neutral-900">{item.method}</span>
                    <span className="text-neutral-600">
                      {formatCurrency(item.amount)} • {item.percentage}%
                    </span>
                  </div>
                  <div className="bg-neutral-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-success h-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm mb-8">
          <h3 className="text-xl font-bold text-neutral-900 mb-6">Produtos Mais Vendidos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-neutral-700">Produto</th>
                  <th className="px-4 py-3 font-semibold text-neutral-700">Quantidade</th>
                  <th className="px-4 py-3 font-semibold text-neutral-700">Faturamento</th>
                  <th className="px-4 py-3 font-semibold text-neutral-700">% do Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Pizza Calabresa', qty: 18, revenue: 936.0, percent: 28 },
                  { name: 'Pizza Mozzarella', qty: 16, revenue: 720.0, percent: 22 },
                  { name: 'Hambúrguer Clássico', qty: 12, revenue: 336.0, percent: 10 },
                  { name: 'Pizza Pepperoni', qty: 10, revenue: 550.0, percent: 17 },
                  { name: 'Refrigerante', qty: 25, revenue: 200.0, percent: 6 },
                ].map((product) => (
                  <tr key={product.name} className="border-b border-neutral-200 hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-900">{product.name}</td>
                    <td className="px-4 py-3 text-neutral-600">{product.qty}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(product.revenue)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-neutral-200 rounded-full h-2 w-20">
                          <div
                            className="bg-primary h-full"
                            style={{ width: `${product.percent}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{product.percent}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
            <p className="text-neutral-600 text-sm mb-2">Ticket Médio</p>
            <p className="text-3xl font-bold text-primary">R$ 102,10</p>
            <p className="text-sm text-neutral-600 mt-2">média por pedido</p>
          </div>

          <div className="bg-gradient-to-br from-success/10 to-success/5 border border-success/20 rounded-lg p-6">
            <p className="text-neutral-600 text-sm mb-2">Taxa de Entrega</p>
            <p className="text-3xl font-bold text-success">R$ 120,00</p>
            <p className="text-sm text-neutral-600 mt-2">faturado em entregas</p>
          </div>

          <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 rounded-lg p-6">
            <p className="text-neutral-600 text-sm mb-2">Conversão</p>
            <p className="text-3xl font-bold text-secondary">85%</p>
            <p className="text-sm text-neutral-600 mt-2">de checkout completado</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
