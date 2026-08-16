import { getStoreSettings, CardRates } from './settings';

export interface OrderAddress {
  street: string;
  number: string;
  neighborhood: string;
  complement?: string;
  reference?: string;
  cep?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  observation?: string;
}

export interface ShiftOrder {
  id: string;
  orderNumber: number;
  customerName: string;
  phone: string;
  orderType: 'mesa' | 'retirada' | 'entrega';
  tableNumber?: string;
  address?: OrderAddress;
  needChange?: boolean;
  changeFor?: number;
  itemsSummary: string;
  itemsList?: OrderItem[];
  total: number;
  paymentMethod:
    | 'dinheiro'
    | 'pix'
    | 'credito_online'
    | 'debito_online'
    | 'credito_presencial'
    | 'debito_presencial';
  isPaid: boolean;
  status: 'preparo' | 'despachado' | 'finalizado' | 'cancelado';
  source: 'manual' | 'ifood' | 'site';
  motoboy?: string;
  createdAt: string;
  timestamp: number;
}

export interface PaymentBreakdown {
  method: string;
  label: string;
  grossAmount: number;
  feeRate: number;
  feeAmount: number;
  netAmount: number;
  orderCount: number;
}

export interface ClosureReport {
  sessionId: string;
  openedAt: string;
  closedAt: string;
  initialCash: number;
  operatorName?: string;
  operatorUsername?: string;
  grossTotal: number;
  totalFees: number;
  netTotal: number;
  totalCashInHand: number;
  breakdown: PaymentBreakdown[];
}

export interface CashSession {
  id: string;
  isOpen: boolean;
  openedAt: string;
  closedAt?: string;
  initialCash: number;
  operatorName?: string;
  operatorUsername?: string;
  orders: ShiftOrder[];
  closureReport?: ClosureReport;
}

const STORAGE_KEY = 'garagem_cash_session';
const STORAGE_HISTORY = 'garagem_all_orders_history';

export function getCurrentCashSession(): CashSession {
  if (typeof window === 'undefined') {
    return { id: '1', isOpen: false, openedAt: '', initialCash: 0, orders: [] };
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return { id: Date.now().toString(), isOpen: false, openedAt: '', initialCash: 0, orders: [] };
  }

  try {
    return JSON.parse(saved);
  } catch {
    return { id: Date.now().toString(), isOpen: false, openedAt: '', initialCash: 0, orders: [] };
  }
}

export function openCashRegister(
  initialCash: number,
  operatorName: string = 'Gestor / Sistema',
  operatorUsername: string = '@gestor'
): CashSession {
  const newSession: CashSession = {
    id: Date.now().toString(),
    isOpen: true,
    openedAt: new Date().toLocaleString('pt-BR'),
    initialCash,
    operatorName,
    operatorUsername,
    orders: [],
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
  }

  return newSession;
}

// Grava o pedido garantindo sequencialidade unificada de ordens (#1, #2, #3)
export function registerOrderInCash(
  orderData: Omit<ShiftOrder, 'id' | 'orderNumber' | 'createdAt' | 'timestamp'>
): ShiftOrder {
  const session = getCurrentCashSession();
  const globalHistory = getGlobalOrderHistory();
  const currentTimestamp = Date.now();

  const maxOrderNumber = Math.max(
    ...session.orders.map((o) => o.orderNumber || 0),
    ...globalHistory.map((h) => h.orderNumber || 0),
    0
  );

  const nextNumber = maxOrderNumber + 1;

  const newOrder: ShiftOrder = {
    ...orderData,
    id: currentTimestamp.toString(),
    orderNumber: nextNumber,
    createdAt: new Date().toLocaleString('pt-BR'),
    timestamp: currentTimestamp,
  };

  const updatedSession: CashSession = {
    ...session,
    orders: [newOrder, ...session.orders.filter((o) => o.id !== newOrder.id)],
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSession));
    saveToGlobalOrderHistory(newOrder);
  }

  return newOrder;
}

export function updateOrderInCash(updatedOrder: ShiftOrder) {
  const session = getCurrentCashSession();
  const updatedOrders = session.orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));

  const updatedSession: CashSession = {
    ...session,
    orders: updatedOrders,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSession));
    saveToGlobalOrderHistory(updatedOrder);
  }
}

function saveToGlobalOrderHistory(order: ShiftOrder) {
  if (typeof window === 'undefined') return;
  const saved = localStorage.getItem(STORAGE_HISTORY);
  let history: ShiftOrder[] = saved ? JSON.parse(saved) : [];

  const index = history.findIndex((h) => h.id === order.id);
  if (index >= 0) {
    history[index] = order;
  } else {
    history.unshift(order);
  }

  localStorage.setItem(STORAGE_HISTORY, JSON.stringify(history));
}

export function getGlobalOrderHistory(): ShiftOrder[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_HISTORY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

// Relatório por Período Personalizado com Filtro de Data Inicial e Final
export function calculateRevenueByCustomRange(startDateStr: string, endDateStr: string) {
  const history = getGlobalOrderHistory().filter((o) => o.status === 'finalizado' && o.isPaid);

  let startTs = 0;
  let endTs = Date.now();

  if (startDateStr) {
    startTs = new Date(`${startDateStr}T00:00:00`).getTime();
  }

  if (endDateStr) {
    endTs = new Date(`${endDateStr}T23:59:59`).getTime();
  }

  const filteredOrders = history.filter((o) => o.timestamp >= startTs && o.timestamp <= endTs);
  const grossTotal = filteredOrders.reduce((sum, o) => sum + o.total, 0);

  const settings = getStoreSettings();
  const rates = settings.cardRates;

  let totalFees = 0;
  filteredOrders.forEach((o) => {
    let feeRate = 0;
    if (o.paymentMethod === 'credito_online') feeRate = rates.creditOnlineFee || 0;
    if (o.paymentMethod === 'debito_online') feeRate = rates.debitOnlineFee || 0;
    if (o.paymentMethod === 'credito_presencial') feeRate = rates.creditInPersonFee || 0;
    if (o.paymentMethod === 'debito_presencial') feeRate = rates.debitInPersonFee || 0;
    if (o.paymentMethod === 'pix') feeRate = rates.pixFee || 0;

    totalFees += (o.total * feeRate) / 100;
  });

  return {
    grossTotal,
    totalFees,
    netTotal: grossTotal - totalFees,
    totalOrders: filteredOrders.length,
    orders: filteredOrders,
  };
}

export function closeCashRegisterWithOperation(): { session: CashSession; report: ClosureReport } {
  const session = getCurrentCashSession();
  const settings = getStoreSettings();
  const rates: CardRates = settings.cardRates;

  const paymentTypes = [
    { key: 'dinheiro', label: 'Dinheiro (Em Espécie)', fee: 0 },
    { key: 'pix', label: 'PIX', fee: rates.pixFee || 0 },
    { key: 'credito_online', label: 'Crédito Online (App/Site)', fee: rates.creditOnlineFee || 0 },
    { key: 'debito_online', label: 'Débito Online (App/Site)', fee: rates.debitOnlineFee || 0 },
    { key: 'credito_presencial', label: 'Crédito Presencial (Maquininha)', fee: rates.creditInPersonFee || 0 },
    { key: 'debito_presencial', label: 'Débito Presencial (Maquininha)', fee: rates.debitInPersonFee || 0 },
  ];

  let grossTotal = 0;
  let totalFees = 0;
  let netTotal = 0;
  let cashSalesTotal = 0;

  const paidOrders = session.orders.filter((o) => o.isPaid && o.status !== 'cancelado');

  const breakdown: PaymentBreakdown[] = paymentTypes.map((pt) => {
    const matchingOrders = paidOrders.filter((o) => o.paymentMethod === pt.key);
    const grossAmount = matchingOrders.reduce((sum, o) => sum + o.total, 0);
    const feeAmount = (grossAmount * pt.fee) / 100;
    const netAmount = grossAmount - feeAmount;

    grossTotal += grossAmount;
    totalFees += feeAmount;
    netTotal += netAmount;

    if (pt.key === 'dinheiro') {
      cashSalesTotal += grossAmount;
    }

    return {
      method: pt.key,
      label: pt.label,
      grossAmount,
      feeRate: pt.fee,
      feeAmount,
      netAmount,
      orderCount: matchingOrders.length,
    };
  });

  const report: ClosureReport = {
    sessionId: session.id,
    openedAt: session.openedAt,
    closedAt: new Date().toLocaleString('pt-BR'),
    initialCash: session.initialCash,
    operatorName: session.operatorName,
    operatorUsername: session.operatorUsername,
    grossTotal,
    totalFees,
    netTotal,
    totalCashInHand: session.initialCash + cashSalesTotal,
    breakdown,
  };

  const closedSession: CashSession = {
    ...session,
    isOpen: false,
    closedAt: report.closedAt,
    closureReport: report,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(closedSession));
    const historySaved = localStorage.getItem('garagem_cash_history');
    const history = historySaved ? JSON.parse(historySaved) : [];
    history.unshift(report);
    localStorage.setItem('garagem_cash_history', JSON.stringify(history));
  }

  return { session: closedSession, report };
}