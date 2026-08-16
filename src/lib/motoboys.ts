export interface Motoboy {
  id: string;
  name: string;
  cpf?: string;
  birthDate?: string; // Data de nascimento
  phone: string;
  vehicle: string;
  deliveryFeeRate: number;
}

const STORAGE_KEY = 'garagem_motoboys_list';

export function getMotoboys(): Motoboy[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveMotoboys(list: Motoboy[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}