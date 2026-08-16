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
  MapPin,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import {
  getCurrentCashSession,
  registerOrderInCash,
  updateOrderInCash,
  calculateRevenueByCustomRange,
  ShiftOrder,
  OrderItem,
  OrderAddress,
} from '@/lib/cash-register';
import { syncIFoodOrders } from '@/lib/ifood';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<ShiftOrder[]>([]);
  const [motoboyInputs, setMotoboyInputs] = useState<Record<string, string>>({});
  const [autoPrint, setAutoPrint] = useState(false);
  const [selectedOrderToPrint, setSelectedOrderToPrint] = useState<ShiftOrder | null>(null);

  // Cardápio para seleção no pedido manual
  const [menuList, setMenuList] = useState<{ id: string; title: string; price: number }[]>([]);

  // Modal Novo Pedido Manual
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [manualType, setManualType] = useState<'mesa' | 'retirada' | 'entrega'>('mesa');
  const [manualTable, setManualTable] = useState('01');
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');

  // Endereço de Entrega
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressNeighborhood, setAddressNeighborhood] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [addressReference, setAddressReference] = useState('');
  const [addressCep, setAddressCep] = useState('');

  // Itens do Pedido Manual
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemObs, setItemObs] = useState('');
  const [manualCart, setManualCart] = useState<OrderItem[]>([]);

  // Pagamento e Troco
  const [manualPaymentMethod, setManualPaymentMethod] = useState<ShiftOrder['paymentMethod']>('dinheiro');
  const [needChange, setNeedChange] = useState(false);
  const [changeForInput, setChangeForInput] = useState('');
  const [manualIsPaid, setManualIsPaid] = useState(true);

  // Modal Confirmação de Pagamento para Finalizar
  const [orderToFinalize, setOrderToFinalize] = useState<ShiftOrder | null>(null);
  const [finalizePaymentMethod, setFinalizePaymentMethod] = useState<ShiftOrder['paymentMethod']>('dinheiro');

  // Modal Relatório por Período por Data
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [revenueResult, setRevenueResult] = useState({ grossTotal: 0, totalFees: 0, netTotal: 0, totalOrders: 0 });

  const knownOrderIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const savedAutoPrint = localStorage.getItem('garagem_auto_print');
    if (savedAutoPrint !== null) {
      setAutoPrint(JSON.parse(savedAutoPrint));
    }

    loadMenu();
    loadOrders();

    const interval = setInterval(async () => {
      await syncIFoodOrders();
      loadOrders();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const loadMenu = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('garagem_menu_items');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMenuList(parsed.map((p: any) => ({ id: p.id, title: p.title || p.name, price: p.price || 0 })));
          return;
        } catch (e) {
          console.error(e);
        }
      }
    }
    // Cardápio Padrão de Exemplo
    setMenuList([
      { id: '1', title: 'Pizza Calabresa Especial', price: 45.0 },
      { id: '2', title: 'Pizza Quatro Queijos Premium', price: 49.9 },
      { id: '3', title: 'Coca-Cola 2 Litros', price: 14.0 },
      { id: '4', title: 'Guaraná Antarctica 2L', price: 12.0 },
    ]);
  };

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

  // Adicionar item do cardápio ao pedido manual
  const handleAddItemToCart = () => {
    if (!selectedProductId) return;
    const prod = menuList.find((m) => m.id === selectedProductId);
    if (!prod) return;

    const qty = parseInt(itemQuantity) || 1;
    const newItem: OrderItem = {
      id: Date.now().toString(),
      name: prod.title,
      price: prod.price,
      quantity: qty,
      observation: itemObs.trim() || undefined,
    };

    setManualCart([...manualCart, newItem]);
    setSelectedProductId('');
    setItemQuantity('1');
    setItemObs('');
  };

  const handleRemoveCartItem = (id: string) => {
    setManualCart(manualCart.filter((item) => item.id !== id));
  };

  const calculateCartTotal = () => {
    return manualCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Criar Pedido Manual
  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || manualCart.length === 0) return;

    const totalVal = calculateCartTotal();
    const itemsSummaryStr = manualCart
      .map((i) => `${i.quantity}x ${i.name}${i.observation ? ` (${i.observation})` : ''}`)
      .join(', ');

    let addressObj: OrderAddress | undefined;
    if (manualType === 'entrega') {
      addressObj = {
        street: addressStreet,
        number: addressNumber,
        neighborhood: addressNeighborhood,
        complement: addressComplement,
        reference: addressReference,
        cep: addressCep,
      };
    }

    const changeForVal = parseFloat(changeForInput) || 0;

    const newOrd = registerOrderInCash({
      customerName: manualName,
      phone: manualPhone,
      orderType: manualType,
      tableNumber: manualType === 'mesa' ? manualTable : undefined,
      address: addressObj,
      itemsSummary: itemsSummaryStr,
      itemsList: manualCart,
      total: totalVal,
      paymentMethod: manualPaymentMethod,
      needChange: manualPaymentMethod === 'dinheiro' ? needChange : false,
      changeFor: manualPaymentMethod === 'dinheiro' && needChange ? changeForVal : undefined,
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
    setAddressStreet('');
    setAddressNumber('');
    setAddressNeighborhood('');
    setAddressComplement('');
    setAddressReference('');
    setAddressCep('');
    setManualCart([]);
    setManualPaymentMethod('dinheiro');
    setNeedChange(false);
    setChangeForInput('');
    setManualIsPaid(true);
  };

  const handleUpdateStatus = (ord: ShiftOrder, status: ShiftOrder['status']) => {
    const updated: ShiftOrder = { ...ord, status };
    updateOrderInCash(updated);
    loadOrders();
  };

  const handleAttemptFinalize = (ord: ShiftOrder) => {
    if (ord.isPaid) {
      handleUpdateStatus(ord, 'finalizado');
    } else {
      setOrderToFinalize(ord);
      setFinalizePaymentMethod(ord.paymentMethod);
    }
  };

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

  const handleCalculateCustomRevenue = () => {
    const res = calculateRevenueByCustomRange(startDateFilter, endDateFilter);
    setRevenueResult(res);
  };

  const openRevenueModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDateFilter(today);
    setEndDateFilter(today);
    const res = calculateRevenueByCustomRange(today, today);
    setRevenueResult(res);
    setShowRevenueModal(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      {/* Estilo CSS para Impressão Térmica em 2 Vias (80mm) */}
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
          .receipt-page {
            page-break-after: always;
            margin-bottom: 20px;
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

      {/* Listagem Única de Pedidos */}
      <div className="max-w-6xl mx-auto px-4 mt-6 space-y-4 print:hidden">
        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center text-neutral-500 border border-neutral-200 shadow-sm space-y-3">
            <ShoppingBag size={36} className="mx-auto text-neutral-300" />
            <p className="font-bold text-neutral-700">Nenhum pedido no caixa aberto no momento.</p>
            <p className="text-xs text-neutral-400">Clique em "Novo Pedido Manual" acima para lançar uma venda.</p>
          </div>
        ) : (
          orders.map((ord) => (
            <div key={ord.id} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-3 gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-neutral-900 text-white font-bold rounded-lg text-xs">
                    PEDIDO #{ord.orderNumber}
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
                    title="Imprimir 2 Vias"
                  >
                    <Printer size={16} /> Imprimir 2 Vias
                  </button>
                </div>
              </div>

              {/* Detalhes do Cliente, Endereço e Itens */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-bold text-neutral-800 block text-sm">{ord.customerName}</span>
                  <span className="text-neutral-500 block">{ord.createdAt} • Tel: {ord.phone || 'Não informado'}</span>

                  {ord.address && (
                    <div className="mt-2 p-2 bg-purple-50 border border-purple-100 rounded-lg text-[11px] text-purple-950 space-y-0.5">
                      <span className="font-bold flex items-center gap-1">
                        <MapPin size={12} className="text-purple-600" /> Endereço de Entrega:
                      </span>
                      <p>{ord.address.street}, Nº {ord.address.number} - {ord.address.neighborhood}</p>
                      {ord.address.complement && <p>Compl: {ord.address.complement}</p>}
                      {ord.address.reference && <p>Ref: {ord.address.reference}</p>}
                    </div>
                  )}

                  {ord.needChange && ord.changeFor && (
                    <span className="inline-block mt-2 font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                      Troco para: R$ {ord.changeFor.toFixed(2)} (Troco: R$ {(ord.changeFor - ord.total).toFixed(2)})
                    </span>
                  )}
                </div>

                <div className="md:col-span-2 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <span className="font-bold text-neutral-700 block mb-1">Itens do Pedido:</span>
                  <p className="text-neutral-800 font-medium leading-relaxed">{ord.itemsSummary}</p>
                </div>
              </div>

              {/* Controles de Motoboy e Status do Ciclo */}
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

      {/* MODAL 1: NOVO PEDIDO MANUAL COMPLETO */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl max-w-2xl w-full my-8 space-y-4 shadow-xl border border-neutral-200">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Plus size={18} className="text-emerald-600" /> Lançar Pedido Manual
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

              {/* Dados do Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Nome Completo do Cliente</label>
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

              {/* Dados de Entrega (Se Entrega) */}
              {manualType === 'entrega' && (
                <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl space-y-3">
                  <span className="font-bold text-purple-900 flex items-center gap-1.5">
                    <MapPin size={16} /> Endereço Completo de Entrega
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-neutral-700 mb-0.5">Rua / Logradouro</label>
                      <input
                        type="text"
                        required
                        value={addressStreet}
                        onChange={(e) => setAddressStreet(e.target.value)}
                        placeholder="Ex: Av. Brasil"
                        className="w-full p-2 border border-neutral-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-0.5">Número</label>
                      <input
                        type="text"
                        required
                        value={addressNumber}
                        onChange={(e) => setAddressNumber(e.target.value)}
                        placeholder="Ex: 123"
                        className="w-full p-2 border border-neutral-300 rounded bg-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-0.5">Bairro</label>
                      <input
                        type="text"
                        required
                        value={addressNeighborhood}
                        onChange={(e) => setAddressNeighborhood(e.target.value)}
                        placeholder="Ex: Centro"
                        className="w-full p-2 border border-neutral-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-0.5">Complemento</label>
                      <input
                        type="text"
                        value={addressComplement}
                        onChange={(e) => setAddressComplement(e.target.value)}
                        placeholder="Ex: Apto 201"
                        className="w-full p-2 border border-neutral-300 rounded bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-0.5">Ponto de Referência</label>
                      <input
                        type="text"
                        value={addressReference}
                        onChange={(e) => setAddressReference(e.target.value)}
                        placeholder="Ex: Próximo à farmácia"
                        className="w-full p-2 border border-neutral-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-0.5">CEP</label>
                      <input
                        type="text"
                        value={addressCep}
                        onChange={(e) => setAddressCep(e.target.value)}
                        placeholder="00000-000"
                        className="w-full p-2 border border-neutral-300 rounded bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Seleção de Itens do Cardápio */}
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                <span className="font-bold text-neutral-900 block">Adicionar Itens do Cardápio</span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full p-2 border border-neutral-300 rounded bg-white font-semibold"
                    >
                      <option value="">-- Selecione o Produto --</option>
                      {menuList.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title} (R$ {m.price.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value)}
                      className="w-16 p-2 border border-neutral-300 rounded bg-white font-bold text-center"
                    />
                    <button
                      type="button"
                      onClick={handleAddItemToCart}
                      className="flex-1 bg-neutral-900 text-white font-bold rounded p-2 hover:bg-neutral-800"
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={itemObs}
                  onChange={(e) => setItemObs(e.target.value)}
                  placeholder="Observação do item (Ex: Sem cebola, massa fina...)"
                  className="w-full p-2 border border-neutral-300 rounded bg-white text-xs"
                />

                {/* Lista de Itens do Carrinho Manual */}
                {manualCart.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-neutral-200">
                    {manualCart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-white p-2 border border-neutral-200 rounded">
                        <div>
                          <span className="font-bold text-neutral-900">{item.quantity}x {item.name}</span>
                          {item.observation && <span className="text-[10px] text-neutral-500 block">Obs: {item.observation}</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-emerald-600">R$ {(item.price * item.quantity).toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCartItem(item.id)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-between items-center font-bold text-sm text-neutral-900 pt-2">
                      <span>Total do Pedido:</span>
                      <span className="text-emerald-700 text-base">R$ {calculateCartTotal().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pagamento e Troco */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Forma de Pagamento</label>
                  <select
                    value={manualPaymentMethod}
                    onChange={(e) => setManualPaymentMethod(e.target.value as any)}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg font-bold text-neutral-900 bg-white"
                  >
                    <option value="dinheiro">Dinheiro (Em Espécie)</option>
                    <option value="pix">PIX</option>
                    <option value="credito_presencial">Crédito Maquininha</option>
                    <option value="debito_presencial">Débito Maquininha</option>
                  </select>
                </div>

                {manualPaymentMethod === 'dinheiro' && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-bold text-neutral-800 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        checked={needChange}
                        onChange={(e) => setNeedChange(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      Precisa de Troco?
                    </label>

                    {needChange && (
                      <div>
                        <input
                          type="number"
                          step="5.00"
                          required
                          value={changeForInput}
                          onChange={(e) => setChangeForInput(e.target.value)}
                          placeholder="Troco para R$ (Ex: 100.00)"
                          className="w-full p-2 border border-neutral-300 rounded font-bold text-neutral-900 bg-white"
                        />
                        {parseFloat(changeForInput) > calculateCartTotal() && (
                          <span className="text-[11px] font-bold text-amber-800 block mt-1">
                            Devolver de Troco: R$ {(parseFloat(changeForInput) - calculateCartTotal()).toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 font-bold text-neutral-900 cursor-pointer p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <input
                  type="checkbox"
                  checked={manualIsPaid}
                  onChange={(e) => setManualIsPaid(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                Confirmar que o Pagamento Foi Efetuado (Realizar Pedido)
              </label>

              <button
                type="submit"
                disabled={manualCart.length === 0}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white font-bold rounded-xl text-sm shadow-sm"
              >
                Lançar Pedido & Imprimir 2 Vias
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

      {/* MODAL 3: FATURAMENTO POR PERÍODO POR DATA */}
      {showRevenueModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl border border-neutral-200">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" /> Relatório de Faturamento por Data
              </h2>
              <button onClick={() => setShowRevenueModal(false)} className="p-1 text-neutral-400 hover:text-neutral-800">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Data Inicial</label>
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Data Final</label>
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded font-bold"
                />
              </div>
            </div>

            <button
              onClick={handleCalculateCustomRevenue}
              className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-700 flex items-center justify-center gap-1.5"
            >
              <Calendar size={16} /> Consultar Período
            </button>

            <div className="space-y-2 text-xs border-t border-neutral-100 pt-3">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex justify-between items-center">
                <span className="font-semibold text-neutral-600">Total de Pedidos Concluídos:</span>
                <span className="font-bold text-neutral-900 text-sm">{revenueResult.totalOrders} pedidos</span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex justify-between items-center">
                <span className="font-semibold text-neutral-600">Faturamento Bruto:</span>
                <span className="font-bold text-neutral-900 text-sm">R$ {revenueResult.grossTotal.toFixed(2)}</span>
              </div>

              <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex justify-between items-center">
                <span className="font-semibold text-red-600">Total Taxas Descontadas:</span>
                <span className="font-bold text-red-700 text-sm">- R$ {revenueResult.totalFees.toFixed(2)}</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                <span className="font-bold text-emerald-800">Faturamento Líquido Real:</span>
                <span className="font-bold text-emerald-700 text-base">R$ {revenueResult.netTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IMPRESSÃO TÉRMICA EM 2 VIAS (80MM) */}
      {selectedOrderToPrint && (
        <div id="thermal-receipt" className="hidden print:block">
          {/* ================= VIA 1: VIA DA LOJA ================= */}
          <div className="receipt-page">
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>GARAGEM.COM</h2>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: 'bold' }}>--- VIA DA LOJA ---</p>
              <p style={{ margin: '4px 0', borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '3px 0' }}>
                <strong>PEDIDO #{selectedOrderToPrint.orderNumber}</strong> ({selectedOrderToPrint.orderType.toUpperCase()})
              </p>
            </div>

            <p style={{ margin: '2px 0' }}>Data: {selectedOrderToPrint.createdAt}</p>
            <p style={{ margin: '2px 0' }}>Cliente: <strong>{selectedOrderToPrint.customerName}</strong></p>
            <p style={{ margin: '2px 0' }}>Telefone: {selectedOrderToPrint.phone}</p>
            {selectedOrderToPrint.orderType === 'mesa' && <p style={{ margin: '2px 0' }}>Mesa: {selectedOrderToPrint.tableNumber}</p>}

            {selectedOrderToPrint.address && (
              <div style={{ marginTop: '4px', padding: '3px', border: '1px solid #000' }}>
                <strong>Endereço:</strong><br />
                {selectedOrderToPrint.address.street}, Nº {selectedOrderToPrint.address.number}<br />
                Bairro: {selectedOrderToPrint.address.neighborhood}<br />
                {selectedOrderToPrint.address.complement && <>Compl: {selectedOrderToPrint.address.complement}<br /></>}
                {selectedOrderToPrint.address.reference && <>Ref: {selectedOrderToPrint.address.reference}</>}
              </div>
            )}

            <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }}></div>

            <p style={{ margin: '2px 0', fontWeight: 'bold' }}>ITENS DO PEDIDO:</p>
            <p style={{ margin: '2px 0' }}>{selectedOrderToPrint.itemsSummary}</p>

            <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }}></div>

            <p style={{ margin: '2px 0', fontWeight: 'bold' }}>PAGAMENTO & TROCO:</p>
            <p style={{ margin: '2px 0', textTransform: 'uppercase' }}>
              Método: {selectedOrderToPrint.paymentMethod}<br />
              Status: <strong>{selectedOrderToPrint.isPaid ? 'PAGO' : '⚠️ COBRAR CLIENTE NO ATO'}</strong>
            </p>

            {selectedOrderToPrint.needChange && selectedOrderToPrint.changeFor && (
              <p style={{ margin: '2px 0', fontWeight: 'bold' }}>
                Troco para: R$ {selectedOrderToPrint.changeFor.toFixed(2)} (Devolver: R$ {(selectedOrderToPrint.changeFor - selectedOrderToPrint.total).toFixed(2)})
              </p>
            )}

            <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 'bold', marginTop: '6px' }}>
              TOTAL: R$ {selectedOrderToPrint.total.toFixed(2)}
            </div>
          </div>

          {/* ================= VIA 2: VIA DO MOTOBOY ================= */}
          <div className="receipt-page">
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>GARAGEM.COM</h2>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: 'bold' }}>--- VIA DO MOTOBOY / ENTREGADOR ---</p>
              <p style={{ margin: '4px 0', borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '3px 0' }}>
                <strong>PEDIDO #{selectedOrderToPrint.orderNumber}</strong> ({selectedOrderToPrint.orderType.toUpperCase()})
              </p>
            </div>

            <p style={{ margin: '2px 0' }}>Cliente: <strong>{selectedOrderToPrint.customerName}</strong></p>
            <p style={{ margin: '2px 0' }}>Telefone: {selectedOrderToPrint.phone}</p>

            {selectedOrderToPrint.address ? (
              <div style={{ margin: '5px 0', padding: '5px', border: '1px solid #000', fontSize: '12px' }}>
                <strong>ENDEREÇO DE ENTREGA:</strong><br />
                {selectedOrderToPrint.address.street}, Nº {selectedOrderToPrint.address.number}<br />
                Bairro: {selectedOrderToPrint.address.neighborhood}<br />
                {selectedOrderToPrint.address.complement && <>Compl: {selectedOrderToPrint.address.complement}<br /></>}
                {selectedOrderToPrint.address.reference && <>Ref: {selectedOrderToPrint.address.reference}</>}
              </div>
            ) : (
              <p style={{ margin: '2px 0' }}>RETIRADA NO BALCÃO / MESA</p>
            )}

            <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }}></div>

            <p style={{ margin: '2px 0', fontWeight: 'bold', fontSize: '12px' }}>INSTRUÇÕES DE COBRANÇA:</p>
            {selectedOrderToPrint.isPaid ? (
              <p style={{ margin: '2px 0', fontSize: '13px', fontWeight: 'bold' }}>
                ✅ PEDIDO JÁ PAGO! (NÃO COBRAR O CLIENTE)
              </p>
            ) : (
              <p style={{ margin: '2px 0', fontSize: '13px', fontWeight: 'bold' }}>
                🔴 COBRAR DO CLIENTE: R$ {selectedOrderToPrint.total.toFixed(2)} ({selectedOrderToPrint.paymentMethod.toUpperCase()})
              </p>
            )}

            {selectedOrderToPrint.needChange && selectedOrderToPrint.changeFor && (
              <div style={{ marginTop: '4px', padding: '4px', border: '1px dashed #000', fontSize: '12px', fontWeight: 'bold' }}>
                👉 LEVAR R$ {(selectedOrderToPrint.changeFor - selectedOrderToPrint.total).toFixed(2)} DE TROCO<br />
                (Cliente pagará com R$ {selectedOrderToPrint.changeFor.toFixed(2)})
              </div>
            )}

            <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }}></div>

            <p style={{ margin: '2px 0', fontWeight: 'bold' }}>RESUMO DOS ITENS:</p>
            <p style={{ margin: '2px 0' }}>{selectedOrderToPrint.itemsSummary}</p>
          </div>
        </div>
      )}
    </div>
  );
}