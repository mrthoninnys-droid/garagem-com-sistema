'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Truck,
  Printer,
  Volume2,
  VolumeX,
  Plus,
  CheckCircle2,
  Utensils,
  ShoppingBag,
  DollarSign,
  Calendar,
  X,
  CreditCard,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import {
  getCurrentCashSession,
  registerOrderInCash,
  updateOrderInCash,
  calculateRevenueByPeriod,
  ShiftOrder,
} from '@/lib/cash-register';
import { syncIFoodOrders } from '@/lib/ifood';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<ShiftOrder[]>([]);
  const [motoboyInputs, setMotoboyInputs] = useState<Record<string, string>>({});
  const [autoPrint, setAutoPrint] = useState(false);
  const [selectedOrderToPrint, setSelectedOrderToPrint] = useState<ShiftOrder | null>(null);

  // Modal Novo Pedido Manual
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [manualType, setManualType] = useState<'mesa' | 'retirada' | 'entrega'>('mesa');
  const [manualTable, setManualTable] = useState('01');
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualItems, setManualItems] = useState('');
  const [manualTotal, setManualTotal] = useState('');
  const [manualPaymentMethod, setManualPaymentMethod] = useState<ShiftOrder['paymentMethod']>('dinheiro');
  const [manualIsPaid, setManualIsPaid] = useState(false);

  // Modal Confirmação de Pagamento para Finalizar
  const [orderToFinalize, setOrderToFinalize] = useState<ShiftOrder | null>(null);
  const [finalizePaymentMethod, setFinalizePaymentMethod] = useState<ShiftOrder['paymentMethod']>('dinheiro');

  // Modal Relatório de Faturamento por Período
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [revenueData, setRevenueData] = useState({ daily: 0, weekly: 0, monthly: 0, semiAnnual: 0, annual: 0 });

  const knownOrderIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const savedAutoPrint = localStorage.getItem('garagem_auto_print');
    if (savedAutoPrint !== null) {
      setAutoPrint(JSON.parse(savedAutoPrint));
    }

    loadOrders();

    const interval = setInterval(async () => {
      await syncIFoodOrders();
      loadOrders();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    const session = getCurrentCashSession();
    const currentOrders = session.orders || [];

    const newOrders = currentOrders.filter((o) => !knownOrderIdsRef.current.has(o.id));

    if (newOrders.length > 0 && knownOrderIdsRef.current.size > 0) {
      const latest = newOrders[0];
      const isAuto = localStorage.getItem('garagem_auto_print');
      if (isAuto && JSON.parse(isAuto)) {
        triggerPrint(latest);
      }
    }

    currentOrders.forEach((o) => knownOrderIdsRef.current.add(o.id));
    setOrders(currentOrders);
  };

  const toggleAutoPrint = () => {
    const newValue = !autoPrint;
    setAutoPrint(newValue);
    localStorage.setItem('garagem_auto_print', JSON.stringify(newValue));
  };

  // Criar Pedido Manual
  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualTotal) return;

    const newOrd = registerOrderInCash({
      customerName: manualName,
      phone: manualPhone,
      orderType: manualType,
      tableNumber: manualType === 'mesa' ? manualTable : undefined,
      itemsSummary: manualItems || 'Itens diversos',
      total: parseFloat(manualTotal) || 0,
      paymentMethod: manualPaymentMethod,
      isPaid: manualIsPaid,
      status: 'preparo',
      source: 'manual',
    });

    setShowNewOrderModal(false);
    resetManualForm();
    loadOrders();
    triggerPrint(newOrd);
  };

  const resetManualForm = () => {
    setManualType('mesa');
    setManualTable('01');
    setManualName('');
    setManualPhone('');
    setManualItems('');
    setManualTotal('');
    setManualPaymentMethod('dinheiro');
    setManualIsPaid(false);
  };

  // Mudar Status (Em Preparo / Despachar)
  const handleUpdateStatus = (ord: ShiftOrder, status: ShiftOrder['status']) => {
    const updated: ShiftOrder = { ...ord, status };
    updateOrderInCash(updated);
    loadOrders();
  };

  // Tentar Finalizar o Pedido (Trava de Pagamento)
  const handleAttemptFinalize = (ord: ShiftOrder) => {
    if (ord.isPaid) {
      // Já está pago -> Finaliza direto
      handleUpdateStatus(ord, 'finalizado');
    } else {
      // Não está pago -> Abre janela de confirmação de pagamento
      setOrderToFinalize(ord);
      setFinalizePaymentMethod(ord.paymentMethod);
    }
  };

  // Confirmar Pagamento e Finalizar
  const handleConfirmPaymentAndFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToFinalize) return;

    const updated: ShiftOrder = {
      ...orderToFinalize,
      paymentMethod: finalizePaymentMethod,
      isPaid: true,
      status: 'finalizado',
    };

    updateOrderInCash(updated);
    setOrderToFinalize(null);
    loadOrders();
  };

  const handleAssignMotoboy = (ord: ShiftOrder) => {
    const name = motoboyInputs[ord.id];
    if (!name) return;

    const updated: ShiftOrder = { ...ord, motoboy: name, status: 'despachado' };
    updateOrderInCash(updated);
    loadOrders();
  };

  const triggerPrint = (order: ShiftOrder) => {
    setSelectedOrderToPrint(order);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const openRevenueModal = () => {
    setRevenueData(calculateRevenueByPeriod());
    setShowRevenueModal(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-receipt,
          #thermal-receipt * {
            visibility: visible;
          }
          #thermal-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 5px;
            font-family: monospace;
            font-size: 11px;
            color: #000;
          }
        }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-neutral-200 p-4 sticky top-0 z-10 print:hidden shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-neutral-900">Gestão de Pedidos & Despacho</h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={16} /> Novo Pedido Manual
            </button>

            <button
              onClick={openRevenueModal}
              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
            >
              <DollarSign size={16} /> Faturamento por Período
            </button>

            <button
              onClick={toggleAutoPrint}
              className={`px-3 py-2.5 rounded-lg font-bold text-xs flex items-center gap-1.5 border transition-colors ${
                autoPrint
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-neutral-100 text-neutral-600 border-neutral-300'
              }`}
            >
              {autoPrint ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>Impressão: {autoPrint ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="max-w-6xl mx-auto px-4 mt-6 space-y-4 print:hidden">
        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center text-neutral-500 border border-neutral-200 shadow-sm space-y-3">
            <ShoppingBag size={36} className="mx-auto text-neutral-300" />
            <p className="font-bold text-neutral-700">Nenhum pedido no caixa aberto no momento.</p>
            <p className="text-xs text-neutral-400">Clique em "Novo Pedido Manual" acima para registrar uma venda.</p>
          </div>
        ) : (
          orders.map((ord) => (
            <div key={ord.id} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-3 gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-neutral-900 text-white font-bold rounded-lg text-xs">
                    #{ord.orderNumber}
                  </span>

                  {ord.orderType === 'mesa' && (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg text-xs flex items-center gap-1">
                      <Utensils size={14} /> MESA {ord.tableNumber}
                    </span>
                  )}

                  {ord.orderType === 'retirada' && (
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-900 font-bold rounded-lg text-xs flex items-center gap-1">
                      <ShoppingBag size={14} /> RETIRADA
                    </span>
                  )}

                  {ord.orderType === 'entrega' && (
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-900 font-bold rounded-lg text-xs flex items-center gap-1">
                      <Truck size={14} /> ENTREGA
                    </span>
                  )}

                  {ord.source === 'ifood' && (
                    <span className="px-2 py-0.5 bg-red-600 text-white font-bold rounded text-[10px] uppercase">
                      iFood
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 text-base">R$ {ord.total.toFixed(2)}</span>
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold">{ord.paymentMethod}</span>
                      {ord.isPaid ? (
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                          PAGO
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded">
                          PENDENTE
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => triggerPrint(ord)}
                    className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg flex items-center gap-1 text-xs font-bold border border-neutral-300"
                    title="Imprimir Cupom"
                  >
                    <Printer size={16} /> Imprimir
                  </button>
                </div>
              </div>

              {/* Detalhes do Cliente e Itens */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-bold text-neutral-800 block">{ord.customerName}</span>
                  <span className="text-neutral-500">{ord.createdAt} • Tel: {ord.phone || 'Não informado'}</span>
                </div>

                <div className="md:col-span-2 p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <span className="font-bold text-neutral-700 block mb-1">Itens do Pedido:</span>
                  <p className="text-neutral-800 font-medium leading-relaxed">{ord.itemsSummary}</p>
                </div>
              </div>

              {/* Motoboy (Se for entrega) e Controle de Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2 border-t border-neutral-100">
                {ord.orderType === 'entrega' ? (
                  <div className="p-2 bg-neutral-50 border border-neutral-200 rounded-lg">
                    {ord.motoboy ? (
                      <div className="flex items-center justify-between text-xs font-bold text-blue-900 bg-blue-50 p-1.5 rounded">
                        <span>Motoboy: {ord.motoboy}</span>
                        <button
                          onClick={() => handleUpdateStatus(ord, 'preparo')}
                          className="text-[10px] text-red-500 hover:underline"
                        >
                          Trocar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nome do Motoboy"
                          value={motoboyInputs[ord.id] || ''}
                          onChange={(e) => setMotoboyInputs({ ...motoboyInputs, [ord.id]: e.target.value })}
                          className="flex-1 p-1.5 border border-neutral-300 rounded text-xs bg-white"
                        />
                        <button
                          onClick={() => handleAssignMotoboy(ord)}
                          className="px-3 py-1.5 bg-neutral-900 text-white font-bold rounded text-xs"
                        >
                          Despachar
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2 justify-start md:justify-end">
                  <button
                    onClick={() => handleUpdateStatus(ord, 'preparo')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                      ord.status === 'preparo' ? 'bg-amber-500 text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    Em Preparo
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(ord, 'despachado')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                      ord.status === 'despachado' ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    Despachar
                  </button>

                  <button
                    onClick={() => handleAttemptFinalize(ord)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                      ord.status === 'finalizado'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-neutral-900 text-white hover:bg-neutral-800'
                    }`}
                  >
                    <CheckCircle2 size={14} /> Finalizar Pedido
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: NOVO PEDIDO MANUAL */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-xl border border-neutral-200">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Plus size={18} className="text-emerald-600" /> Novo Pedido Manual
              </h2>
              <button onClick={() => setShowNewOrderModal(false)} className="p-1 text-neutral-400 hover:text-neutral-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="space-y-4 text-xs">
              {/* Tipo de Pedido */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setManualType('mesa')}
                  className={`py-2.5 rounded-lg font-bold border ${
                    manualType === 'mesa' ? 'bg-amber-500 text-white border-amber-600' : 'bg-neutral-50 text-neutral-700'
                  }`}
                >
                  Mesa
                </button>
                <button
                  type="button"
                  onClick={() => setManualType('retirada')}
                  className={`py-2.5 rounded-lg font-bold border ${
                    manualType === 'retirada' ? 'bg-blue-600 text-white border-blue-700' : 'bg-neutral-50 text-neutral-700'
                  }`}
                >
                  Retirada
                </button>
                <button
                  type="button"
                  onClick={() => setManualType('entrega')}
                  className={`py-2.5 rounded-lg font-bold border ${
                    manualType === 'entrega' ? 'bg-purple-600 text-white border-purple-700' : 'bg-neutral-50 text-neutral-700'
                  }`}
                >
                  Entrega
                </button>
              </div>

              {manualType === 'mesa' && (
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Número da Mesa</label>
                  <input
                    type="text"
                    required
                    value={manualTable}
                    onChange={(e) => setManualTable(e.target.value)}
                    placeholder="Ex: 01"
                    className="w-full p-2.5 border border-neutral-300 rounded-lg font-bold text-neutral-900 bg-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Nome do Cliente</label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Nome"
                    className="w-full p-2.5 border border-neutral-300 rounded-lg text-neutral-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full p-2.5 border border-neutral-300 rounded-lg text-neutral-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Itens do Pedido</label>
                <textarea
                  rows={3}
                  required
                  value={manualItems}
                  onChange={(e) => setManualItems(e.target.value)}
                  placeholder="Ex: 1x Pizza Calabresa, 1x Coca-Cola 2L"
                  className="w-full p-2.5 border border-neutral-300 rounded-lg text-neutral-900 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={manualTotal}
                    onChange={(e) => setManualTotal(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2.5 border border-neutral-300 rounded-lg font-bold text-neutral-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Forma de Pagamento</label>
                  <select
                    value={manualPaymentMethod}
                    onChange={(e) => setManualPaymentMethod(e.target.value as any)}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg font-bold text-neutral-900 bg-white"
                  >
                    <option value="dinheiro">Dinheiro</option>
                    <option value="pix">PIX</option>
                    <option value="credito_presencial">Crédito Maquininha</option>
                    <option value="debito_presencial">Débito Maquininha</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 font-bold text-neutral-800 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={manualIsPaid}
                  onChange={(e) => setManualIsPaid(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                Confirmar que o pagamento já foi efetuado
              </label>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-sm"
              >
                Lançar Pedido & Imprimir
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMAÇÃO OBRIGATÓRIA DE PAGAMENTO */}
      {orderToFinalize && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-xl border border-neutral-200 text-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center mx-auto">
              <CreditCard size={24} />
            </div>

            <div>
              <h3 className="font-bold text-base text-neutral-900">Confirmar Pagamento</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Para finalizar o Pedido #{orderToFinalize.orderNumber}, confirme o recebimento do valor de{' '}
                <strong className="text-emerald-600">R$ {orderToFinalize.total.toFixed(2)}</strong>.
              </p>
            </div>

            <form onSubmit={handleConfirmPaymentAndFinalize} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Forma de Pagamento Utilizada</label>
                <select
                  value={finalizePaymentMethod}
                  onChange={(e) => setFinalizePaymentMethod(e.target.value as any)}
                  className="w-full p-2.5 border border-neutral-300 rounded-lg font-bold text-xs bg-white text-neutral-900"
                >
                  <option value="dinheiro">Dinheiro (Em Espécie)</option>
                  <option value="pix">PIX</option>
                  <option value="credito_presencial">Crédito (Maquininha)</option>
                  <option value="debito_presencial">Débito (Maquininha)</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOrderToFinalize(null)}
                  className="w-1/2 py-2.5 bg-neutral-100 text-neutral-700 font-bold rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 text-white font-bold rounded-lg text-xs hover:bg-emerald-700"
                >
                  Confirmar & Finalizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RELATÓRIO DE FATURAMENTO ACUMULADO */}
      {showRevenueModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl border border-neutral-200">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" /> Relatório de Faturamento Consolidado
              </h2>
              <button onClick={() => setShowRevenueModal(false)} className="p-1 text-neutral-400 hover:text-neutral-800">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex justify-between items-center">
                <span className="font-bold text-neutral-700 flex items-center gap-1.5">
                  <Calendar size={16} className="text-emerald-600" /> Faturamento Diário (Hoje)
                </span>
                <span className="font-bold text-emerald-600 text-sm">R$ {revenueData.daily.toFixed(2)}</span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex justify-between items-center">
                <span className="font-bold text-neutral-700 flex items-center gap-1.5">
                  <Calendar size={16} className="text-blue-600" /> Faturamento Semanal
                </span>
                <span className="font-bold text-blue-600 text-sm">R$ {revenueData.weekly.toFixed(2)}</span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex justify-between items-center">
                <span className="font-bold text-neutral-700 flex items-center gap-1.5">
                  <Calendar size={16} className="text-purple-600" /> Faturamento Mensal
                </span>
                <span className="font-bold text-purple-600 text-sm">R$ {revenueData.monthly.toFixed(2)}</span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex justify-between items-center">
                <span className="font-bold text-neutral-700 flex items-center gap-1.5">
                  <Calendar size={16} className="text-amber-600" /> Faturamento Semestral
                </span>
                <span className="font-bold text-amber-600 text-sm">R$ {revenueData.semiAnnual.toFixed(2)}</span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex justify-between items-center">
                <span className="font-bold text-neutral-700 flex items-center gap-1.5">
                  <Calendar size={16} className="text-indigo-600" /> Faturamento Anual
                </span>
                <span className="font-bold text-indigo-600 text-sm">R$ {revenueData.annual.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowRevenueModal(false)}
              className="w-full py-2.5 bg-neutral-900 text-white font-bold rounded-lg text-xs hover:bg-neutral-800"
            >
              Fechar Relatório
            </button>
          </div>
        </div>
      )}

      {/* Impressão Térmica do Pedido */}
      {selectedOrderToPrint && (
        <div id="thermal-receipt" className="hidden print:block">
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>GARAGEM.COM</h2>
            <p style={{ margin: 0, fontSize: '11px' }}>Pizzaria & Delivery</p>
            <p style={{ margin: '5px 0', borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '3px 0' }}>
              <strong>PEDIDO #{selectedOrderToPrint.orderNumber}</strong> ({selectedOrderToPrint.orderType.toUpperCase()})
            </p>
          </div>

          <p style={{ margin: '3px 0' }}>Data: {selectedOrderToPrint.createdAt}</p>
          <p style={{ margin: '3px 0' }}>Cliente: <strong>{selectedOrderToPrint.customerName}</strong></p>
          <p style={{ margin: '3px 0' }}>Telefone: {selectedOrderToPrint.phone}</p>
          {selectedOrderToPrint.orderType === 'mesa' && <p style={{ margin: '3px 0' }}>Mesa: {selectedOrderToPrint.tableNumber}</p>}
          {selectedOrderToPrint.motoboy && <p style={{ margin: '3px 0' }}>Motoboy: {selectedOrderToPrint.motoboy}</p>}

          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

          <p style={{ margin: '3px 0', fontWeight: 'bold' }}>ITENS DO PEDIDO:</p>
          <p style={{ margin: '3px 0' }}>{selectedOrderToPrint.itemsSummary}</p>

          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

          <p style={{ margin: '3px 0', fontWeight: 'bold' }}>FORMA DE PAGAMENTO:</p>
          <p style={{ margin: '3px 0', textTransform: 'uppercase' }}>
            {selectedOrderToPrint.paymentMethod} ({selectedOrderToPrint.isPaid ? 'PAGO' : 'PENDENTE'})
          </p>

          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

          <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 'bold', marginTop: '5px' }}>
            TOTAL: R$ {selectedOrderToPrint.total.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}