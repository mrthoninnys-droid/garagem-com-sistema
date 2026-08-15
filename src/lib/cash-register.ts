export interface ShiftOrder {
  id: string;
  orderNumber: number;
  customerName: string;
  phone: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
}

export interface CashSession {
  id: string;
  isOpen: boolean;
  openedAt: string;
  closedAt: string | null;
  initialBalance: number; // Fundo de caixa inicial
  currentOrderCount: number; // Contador de pedidos do caixa atual (#1, #2...)
  orders: ShiftOrder[];
}

export interface CashHistorySession extends CashSession {
  totalSales: number;
  salesByPayment: {
    pix: number;
    card: number;
    cash: number;
  };
}

const STORAGE_KEY_CURRENT = 'garagem_current_cash_session';
const STORAGE_KEY_HISTORY = 'garagem_cash_sessions_history';

const DEFAULT_SESSION: CashSession = {
  id: '',
  isOpen: false,
  openedAt: '',
  closedAt: null,
  initialBalance: 0,
  currentOrderCount: 0,
  orders: [],
};

// 1. Obter status do caixa atual
export function getCurrentCashSession(): CashSession {
  if (typeof window === 'undefined') return DEFAULT_SESSION;
  const saved = localStorage.getItem(STORAGE_KEY_CURRENT);
  if (!saved) return DEFAULT_SESSION;
  try {
    return JSON.parse(saved);
  } catch {
    return DEFAULT_SESSION;
  }
}

// 2. Abrir o Caixa (Zera o contador de pedidos para #1)
export function openCashRegister(initialBalance: number): CashSession {
  const newSession: CashSession = {
    id: Date.now().toString(),
    isOpen: true,
    openedAt: new Date().toLocaleString('pt-BR'),
    closedAt: null,
    initialBalance,
    currentOrderCount: 0, // Reinicia os pedidos em #0 (o 1º pedido gerará #1)
    orders: [],
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(newSession));
  }
  return newSession;
}

// 3. Registrar novo pedido no caixa atual e retornar o número do pedido (#1, #2...)
export function registerOrderInCash(orderData: {
  customerName: string;
  phone: string;
  total: number;
  paymentMethod: string;
}): { orderNumber: number; sessionIsOpen: boolean } {
  const current = getCurrentCashSession();

  if (!current.isOpen) {
    return { orderNumber: 0, sessionIsOpen: false };
  }

  const nextNumber = current.currentOrderCount + 1;
  const newOrder: ShiftOrder = {
    id: Date.now().toString(),
    orderNumber: nextNumber,
    customerName: orderData.customerName || 'Cliente',
    phone: orderData.phone || '',
    total: orderData.total,
    paymentMethod: orderData.paymentMethod,
    createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  };

  const updatedSession: CashSession = {
    ...current,
    currentOrderCount: nextNumber,
    orders: [newOrder, ...current.orders],
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(updatedSession));
  }

  return { orderNumber: nextNumber, sessionIsOpen: true };
}

// 4. Fechar o Caixa e salvar no Histórico
export function closeCashRegister(): CashHistorySession | null {
  const current = getCurrentCashSession();
  if (!current.isOpen) return null;

  const totalSales = current.orders.reduce((acc, o) => acc + o.total, 0);

  const salesByPayment = current.orders.reduce(
    (acc, o) => {
      if (o.paymentMethod === 'pix') acc.pix += o.total;
      else if (o.paymentMethod.includes('online') || o.paymentMethod.includes('card') || o.paymentMethod.includes('machine')) acc.card += o.total;
      else acc.cash += o.total;
      return acc;
    },
    { pix: 0, card: 0, cash: 0 }
  );

  const closedHistorySession: CashHistorySession = {
    ...current,
    isOpen: false,
    closedAt: new Date().toLocaleString('pt-BR'),
    totalSales,
    salesByPayment,
  };

  if (typeof window !== 'undefined') {
    // Salva no histórico de caixas anteriores
    const history = getCashHistory();
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify([closedHistorySession, ...history]));

    // Reseta o caixa atual para fechado
    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(DEFAULT_SESSION));
  }

  return closedHistorySession;
}

// 5. Obter histórico de caixas anteriores
export function getCashHistory(): CashHistorySession[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}