import { getStoreSettings, CardRates } from './settings';

export interface ShiftOrder {
  id: string;
  orderNumber: number;
  customerName: string;
  phone: string;
  total: number;
  paymentMethod:
    | 'dinheiro'
    | 'pix'
    | 'credito_online'
    | 'debito_online'
    | 'credito_presencial'
    | 'debito_presencial';
  createdAt: string;
}

export interface PaymentBreakdown {
  method: string;
  label: string;
  grossAmount: number; // Valor Bruto
  feeRate: number;      // Porcentagem de Taxa
  feeAmount: number;    // Valor da Taxa Descontada
  netAmount: number;    // Valor Líquido
  orderCount: number;
}

export interface ClosureReport {
  sessionId: string;
  openedAt: string;
  closedAt: string;
  initialCash: number;
  grossTotal: number;
  totalFees: number;
  netTotal: number;
  totalCashInHand: number; // Troco Inicial + Dinheiro das vendas
  breakdown: PaymentBreakdown[];
}

export interface CashSession {
  id: string;
  isOpen: boolean;
  openedAt: string;
  closedAt?: string;
  initialCash: number;
  orders: ShiftOrder[];
  closureReport?: ClosureReport;
}

const STORAGE_KEY = 'garagem_cash_session';

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

export function openCashRegister(initialCash: number): CashSession {
  const newSession: CashSession = {
    id: Date.now().toString(),
    isOpen: true,
    openedAt: new Date().toLocaleString('pt-BR'),
    initialCash,
    orders: [],
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
  }

  return newSession;
}

export function registerOrderInCash(orderData: Omit<ShiftOrder, 'id' | 'orderNumber' | 'createdAt'>): CashSession {
  const session = getCurrentCashSession();
  if (!session.isOpen) {
    // Se o caixa não estava aberto, abre automaticamente
    openCashRegister(100);
    return registerOrderInCash(orderData);
  }

  const newOrder: ShiftOrder = {
    ...orderData,
    id: Date.now().toString(),
    orderNumber: session.orders.length + 1,
    createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  };

  const updatedSession: CashSession = {
    ...session,
    orders: [newOrder, ...session.orders],
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSession));
  }

  return updatedSession;
}

// Lógica de Operação Completa de Fechamento de Caixa
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

  const breakdown: PaymentBreakdown[] = paymentTypes.map((pt) => {
    const matchingOrders = session.orders.filter((o) => o.paymentMethod === pt.key);
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
    // Salva o histórico de caixas fechados
    const historySaved = localStorage.getItem('garagem_cash_history');
    const history = historySaved ? JSON.parse(historySaved) : [];
    history.unshift(report);
    localStorage.setItem('garagem_cash_history', JSON.stringify(history));
  }

  return { session: closedSession, report };
}