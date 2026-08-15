export interface StoreSettings {
  isOpenManual: boolean; // Forçar aberto ou fechado
  useManualStatus: boolean;
  openTime: string; // Ex: "18:00"
  closeTime: string; // Ex: "23:30"
  adminPassword: string;
  pixKey: string;
  pixKeyType: string;
  bankName: string;
  accountHolder: string;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  isOpenManual: true,
  useManualStatus: true,
  openTime: '18:00',
  closeTime: '23:30',
  adminPassword: 'admin',
  pixKey: '000.000.000-00',
  pixKeyType: 'CPF',
  bankName: 'Banco do Brasil',
  accountHolder: 'Garagem.Com',
};

export function getStoreSettings(): StoreSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const saved = localStorage.getItem('garagem_store_settings');
  if (!saved) return DEFAULT_SETTINGS;
  try {
    return JSON.parse(saved);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoreSettings(settings: StoreSettings) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('garagem_store_settings', JSON.stringify(settings));
  }
}

export function isStoreOpen(): boolean {
  const settings = getStoreSettings();
  if (settings.useManualStatus) {
    return settings.isOpenManual;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = settings.openTime.split(':').map(Number);
  const [closeH, closeM] = settings.closeTime.split(':').map(Number);

  const openMinutes = openH * 60 + openM;
  let closeMinutes = closeH * 60 + closeM;

  if (closeMinutes < openMinutes) {
    closeMinutes += 24 * 60; // Passa da meia-noite
  }

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}