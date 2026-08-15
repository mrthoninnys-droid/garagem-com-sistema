'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Lock,
  Unlock,
  DollarSign,
  TrendingUp,
  Receipt,
  AlertCircle,
  Calendar,
  CreditCard,
  QrCode,
  Banknote,
} from 'lucide-react';
import Link from 'next/link';
import {
  CashSession,
  CashHistorySession,
  getCurrentCashSession,
  openCashRegister,
  closeCashRegister,
  getCashHistory,
} from '@/lib/cash-register';

export default function AdminCashRegisterPage() {
  const [session, setSession] = useState<CashSession | null>(null);
  const [history, setHistory] = useState<CashHistorySession[]>([]);
  const [initialBalanceInput, setInitialBalanceInput] = useState('50.00');
  const [lastClosedSummary, setLastClosedSummary] = useState<CashHistorySession | null>(null);

  useEffect(() => {
    setSession(getCurrentCashSession());
    setHistory(getCashHistory());
  }, []);

  const handleOpenRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(initialBalanceInput) || 0;
    const newSess = openCashRegister(amount);
    setSession(newSess);
    setLastClosedSummary(null);
  };

  const handleCloseRegister = () => {
    if (confirm('Tem certeza que deseja fechar o caixa do turno atual?')) {
      const summary = closeCashRegister();
      setLastClosedSummary(summary);
      setSession(getCurrentCashSession());
      setHistory(getCashHistory());
    }
  };

  if (!session) return null;

  // Cálculos do Caixa Aberto
  const totalSales = session.orders.reduce((acc, o) => acc + o.total, 0);
  const totalCashSales = session.orders
    .filter((o) => o.paymentMethod === 'cash')
    .reduce((acc, o) => acc + o.total, 0);
  const totalPixSales = session.orders
    .filter((o) => o.paymentMethod === 'pix')
    .reduce((acc, o) => acc + o.total, 0);
  const totalCardSales = session.orders
    .filter((o) => o.paymentMethod !== 'cash' && o.paymentMethod !== 'pix')
    .reduce((acc, o) => acc + o.total, 0);

  const expectedCashInDrawer = session.initialBalance + totalCashSales;

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
              <DollarSign className="text-emerald-600" size={24} /> Gestão de Caixa Diário
            </h1>
          </div>
          <div>
            {session.isOpen ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs flex items-center gap-1">
                <Unlock size={14} /> CAIXA ABERTO
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-100 text-red-800 font-bold rounded-full text-xs flex items-center gap-1">
                <Lock size={14} /> CAIXA FECHADO
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* CAIXA FECHADO - Formulário de Abertura */}
        {!session.isOpen && (
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <div className="border-b border-neutral-100 pb-3">
              <h2 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
                <Lock className="text-red-500" size={20} /> Abrir Caixa para Novo Turno
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Ao abrir o caixa, o contador de pedidos reinicia automaticamente no **Pedido #1**.
              </p>
            </div>

            <form onSubmit={handleOpenRegister} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Fundo de Caixa Inicial (Troco R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-neutral-500">R$</span>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={initialBalanceInput}
                    onChange={(e) => setInitialBalanceInput(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Unlock size={18} /> Abrir Caixa Agora
              </button>
            </form>
          </div>
        )}

        {/* RESUMO DO FECHAMENTO MAIS RECENTE */}
        {lastClosedSummary && (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl space-y-3">
            <h3 className="font-bold text-emerald-900 text-lg flex items-center gap-2">
              <Receipt size={20} /> Resumo do Caixa Fechado
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-emerald-900">
              <div>
                <span className="text-xs text-emerald-700 block">Abertura / Fechamento</span>
                <span className="font-semibold">{lastClosedSummary.closedAt}</span>
              </div>
              <div>
                <span className="text-xs text-emerald-700 block">Total de Pedidos</span>
                <span className="font-semibold">{lastClosedSummary.orders.length} pedidos</span>
              </div>
              <div>
                <span className="text-xs text-emerald-700 block">Vendas Totais</span>
                <span className="font-bold text-base">R$ {lastClosedSummary.totalSales.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-xs text-emerald-700 block">Dinheiro em Caixa</span>
                <span className="font-bold text-base">
                  R$ {(lastClosedSummary.initialBalance + lastClosedSummary.salesByPayment.cash).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* CAIXA ABERTO - Dashboard do Turno */}
        {session.isOpen && (
          <div className="space-y-6">
            {/* Cards de Métricas do Caixa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                <span className="text-xs text-neutral-500 block mb-1">Abertura do Caixa</span>
                <span className="font-bold text-neutral-900 text-sm">{session.openedAt}</span>
                <span className="text-[11px] text-neutral-500 block mt-1">Fundo: R$ {session.initialBalance.toFixed(2)}</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                <span className="text-xs text-neutral-500 block mb-1">Total Pedidos Hoje</span>
                <span className="font-bold text-2xl text-neutral-900">#{session.currentOrderCount}</span>
                <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                  {session.orders.length} vendas realizadas
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                <span className="text-xs text-neutral-500 block mb-1">Faturamento do Turno</span>
                <span className="font-bold text-2xl text-emerald-600">R$ {totalSales.toFixed(2)}</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                <span className="text-xs text-neutral-500 block mb-1">Dinheiro em Gaveta</span>
                <span className="font-bold text-2xl text-amber-600">R$ {expectedCashInDrawer.toFixed(2)}</span>
                <span className="text-[11px] text-neutral-400 block mt-1">(Fundo + Vendas em Dinheiro)</span>
              </div>
            </div>

            {/* Vendas por Meio de Pagamento */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
              <h2 className="font-bold text-lg text-neutral-900 border-b border-neutral-100 pb-3">
                Detalhamento por Pagamento
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900">
                    <QrCode size={20} />
                    <span className="font-semibold text-sm">PIX</span>
                  </div>
                  <span className="font-bold text-emerald-800 text-base">R$ {totalPixSales.toFixed(2)}</span>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-900">
                    <CreditCard size={20} />
                    <span className="font-semibold text-sm">Cartão (Crédito/Débito)</span>
                  </div>
                  <span className="font-bold text-blue-800 text-base">R$ {totalCardSales.toFixed(2)}</span>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900">
                    <Banknote size={20} />
                    <span className="font-semibold text-sm">Dinheiro</span>
                  </div>
                  <span className="font-bold text-amber-800 text-base">R$ {totalCashSales.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-end">
                <button
                  onClick={handleCloseRegister}
                  className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-md flex items-center gap-2"
                >
                  <Lock size={18} /> Fechar Caixa do Turno
                </button>
              </div>
            </div>

            {/* Pedidos do Turno */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
              <h2 className="font-bold text-lg text-neutral-900 border-b border-neutral-100 pb-3 flex items-center justify-between">
                <span>Pedidos Realizados neste Turno</span>
                <span className="text-xs font-normal text-neutral-500">{session.orders.length} pedidos</span>
              </h2>

              {session.orders.length === 0 ? (
                <p className="text-center text-neutral-500 py-6 text-sm">
                  Nenhum pedido realizado após a abertura do caixa.
                </p>
              ) : (
                <div className="space-y-2">
                  {session.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg bg-neutral-50 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-neutral-900 text-white font-bold rounded text-xs">
                          Pedido #{ord.orderNumber}
                        </span>
                        <div>
                          <span className="font-bold text-neutral-900 block">{ord.customerName}</span>
                          <span className="text-xs text-neutral-500">{ord.createdAt} • Pagamento: {ord.paymentMethod.toUpperCase()}</span>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-600">R$ {ord.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* HISTÓRICO DE CAIXAS FECHADOS */}
        {history.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <h2 className="font-bold text-lg text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
              <Calendar size={20} /> Histórico de Caixas Fechados Anteriormente
            </h2>

            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="p-4 border border-neutral-200 rounded-lg bg-neutral-50 space-y-2 text-sm">
                  <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                    <span className="font-bold text-neutral-900">Fechado em: {h.closedAt}</span>
                    <span className="font-bold text-emerald-600 text-base">
                      Total Vendido: R$ {h.totalSales.toFixed(2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-neutral-600 pt-1">
                    <span>Pedidos: <strong>{h.orders.length}</strong></span>
                    <span>Troco Inicial: <strong>R$ {h.initialBalance.toFixed(2)}</strong></span>
                    <span>Dinheiro em Caixa: <strong>R$ {(h.initialBalance + h.salesByPayment.cash).toFixed(2)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}