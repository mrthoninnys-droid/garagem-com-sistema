export interface Motoboy {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  deliveryFeeRate: number; // Valor fixo pago por entrega ao motoboy
}

export function getMotoboys(): Motoboy[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('garagem_motoboys');
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveMotoboys(motoboys: Motoboy[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('garagem_motoboys', JSON.stringify(motoboys));
  }
}