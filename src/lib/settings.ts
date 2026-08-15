import { getCurrentCashSession, openCashRegister } from './cash-register';

export interface DaySchedule {
  enabled: boolean;
  openTime: string;  // Ex: "18:00"
  closeTime: string; // Ex: "23:30"
}

export interface CardRates {
  creditOnlineFee: number;      // Ex: 3.5 (%)
  debitOnlineFee: number;       // Ex: 2.0 (%)
  creditInPersonFee: number;    // Ex: 2.5 (%)
  debitInPersonFee: number;     // Ex: 1.5 (%)
  pixFee: number;               // Ex: 0.0 (%)
}

export interface StoreSettings {
  isOpenManual: boolean;
  useManualStatus: boolean; // true = manual, false = horário programado
  adminPassword: string;
  pixKey: string;
  pixKeyType: string;
  bankName: string;
  accountHolder: string;
  cardRates: CardRates;
  weeklySchedule: Record<string, DaySchedule>; // 'segunda', 'terca', etc.
}

export const DAYS_OF_WEEK = [
  { key: 'domingo', label: 'Domingo' },
  { key: 'segunda', label: 'Segunda-feira' },
  { key: 'terca', label: 'Terça-feira' },
  { key: 'quarta', label: 'Quarta-feira' },
  { key: 'quinta', label: 'Quinta-feira' },
  { key: 'sexta', label: 'Sexta-feira' },
  { key: 'sabado', label: 'Sábado' },
];

export const DEFAULT_SETTINGS: StoreSettings = {
  isOpenManual: true,
  useManualStatus: true,
  adminPassword: 'admin',
  pixKey: '000.000.000-00',
  pixKeyType: 'CPF',
  bankName: 'Banco do Brasil',
  accountHolder: 'Garagem.Com',
  cardRates: {
    creditOnlineFee: 3.5,
    debitOnlineFee: 2.0,
    creditInPersonFee: 2.5,
    debitInPersonFee: 1.5,
    pixFee: 0.0,
  },
  weeklySchedule: {
    domingo: { enabled: true, openTime: '18:00', closeTime: '23:30' },
    segunda: { enabled: false, openTime: '18:00', closeTime: '23:30' },
    terca: { enabled: true, openTime: '18:00', closeTime: '23:30' },
    quarta: { enabled: true, openTime: '18:00', closeTime: '23:30' },
    quinta: { enabled: true, openTime: '18:00', closeTime: '23:30' },
    sexta: { enabled: true, openTime: '18:00', closeTime: '00:00' },
    sabado: { enabled: true, openTime: '18:00', closeTime: '00:00' },
  },
};

export function getStoreSettings(): StoreSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const saved = localStorage.getItem('garagem_store_settings');
  if (!saved) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(saved);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      cardRates: { ...DEFAULT_SETTINGS.cardRates, ...(parsed.cardRates || {}) },
      weeklySchedule: { ...DEFAULT_SETTINGS.weeklySchedule, ...(parsed.weeklySchedule || {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoreSettings(settings: StoreSettings) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('garagem_store_settings', JSON.stringify(settings));
  }
}

// Verifica se a loja está aberta no dia e horário atuais
export function isStoreOpen(): boolean {
  const settings = getStoreSettings();

  // Modo Manual
  if (settings.useManualStatus) {
    return settings.isOpenManual;
  }

  // Modo Programado Automático
  const now = new Date();
  const dayIndex = now.getDay(); // 0 = Domingo, 1 = Segunda, ...
  const dayKey = DAYS_OF_WEEK[dayIndex].key;
  const dayConfig = settings.weeklySchedule[dayKey];

  if (!dayConfig || !dayConfig.enabled) {
    return false;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = dayConfig.openTime.split(':').map(Number);
  const [closeH, closeM] = dayConfig.closeTime.split(':').map(Number);

  const openMinutes = openH * 60 + openM;
  let closeMinutes = closeH * 60 + closeM;

  if (closeMinutes < openMinutes) {
    closeMinutes += 24 * 60; // Passa da meia-noite
  }

  const isOpenNow = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;

  // Se a loja abriu automaticamente no horário programado, garante que o caixa também abra!
  if (isOpenNow) {
    const cashSession = getCurrentCashSession();
    if (!cashSession || !cashSession.isOpen) {
      openCashRegister(100); // Abre o caixa automaticamente com troco padrão R$ 100
    }
  }

  return isOpenNow;
}