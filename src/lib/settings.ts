export interface CardRates {
  creditOnlineFee: number;
  debitOnlineFee: number;
  creditInPersonFee: number;
  debitInPersonFee: number;
  pixFee: number;
}

export interface DaySchedule {
  enabled: boolean;
  openTime: string;
  closeTime: string;
}

export interface WeeklySchedule {
  [key: string]: DaySchedule;
}

export interface BankSettings {
  pixKey: string;
  pixKeyType: 'cnpj' | 'cpf' | 'phone' | 'email' | 'random';
  bankName: string;
  accountHolder: string;
  cpfCnpj: string;
}

export interface PaymentGatewaySettings {
  provider: 'mercadopago' | 'asaas' | 'pagbank';
  publicKey: string;
  accessToken: string;
}

export interface StoreSettings {
  isOpenManual: boolean;
  useManualStatus: boolean;
  weeklySchedule: WeeklySchedule;
  cardRates: CardRates;
  bankSettings?: BankSettings;
  gatewaySettings?: PaymentGatewaySettings;
}

export const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

const STORAGE_KEY = 'garagem_store_settings';

export const DEFAULT_SETTINGS: StoreSettings = {
  isOpenManual: true,
  useManualStatus: false,
  weeklySchedule: {
    monday: { enabled: true, openTime: '18:00', closeTime: '23:30' },
    tuesday: { enabled: true, openTime: '18:00', closeTime: '23:30' },
    wednesday: { enabled: true, openTime: '18:00', closeTime: '23:30' },
    thursday: { enabled: true, openTime: '18:00', closeTime: '23:30' },
    friday: { enabled: true, openTime: '18:00', closeTime: '23:59' },
    saturday: { enabled: true, openTime: '18:00', closeTime: '23:59' },
    sunday: { enabled: true, openTime: '18:00', closeTime: '23:30' },
  },
  cardRates: {
    creditOnlineFee: 3.99,
    debitOnlineFee: 1.99,
    creditInPersonFee: 3.19,
    debitInPersonFee: 1.49,
    pixFee: 0.99,
  },
  bankSettings: {
    pixKey: '',
    pixKeyType: 'cnpj',
    bankName: '',
    accountHolder: '',
    cpfCnpj: '',
  },
  gatewaySettings: {
    provider: 'mercadopago',
    publicKey: '',
    accessToken: '',
  },
};

export function getStoreSettings(): StoreSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoreSettings(settings: StoreSettings) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }
}

export function isStoreOpen(): boolean {
  const settings = getStoreSettings();
  if (settings.useManualStatus) {
    return settings.isOpenManual;
  }

  const now = new Date();
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayKey = dayKeys[now.getDay()];
  const dayConfig = settings.weeklySchedule[currentDayKey];

  if (!dayConfig || !dayConfig.enabled) return false;

  const [openHour, openMin] = dayConfig.openTime.split(':').map(Number);
  const [closeHour, closeMin] = dayConfig.closeTime.split(':').map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openHour * 60 + openMin;
  let closeMinutes = closeHour * 60 + closeMin;

  if (closeMinutes < openMinutes) {
    closeMinutes += 24 * 60;
  }

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}