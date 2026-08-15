export interface DeliveryRegion {
  id: string;
  name: string;
  city?: string;
  cepPrefix?: string;
  fee: number;
}

export const DEFAULT_DELIVERY_REGIONS: DeliveryRegion[] = [
  { id: '1', name: 'São Paulo (Zona Central)', city: 'São Paulo', cepPrefix: '01', fee: 6.00 },
  { id: '2', name: 'São Paulo (Demais Zonas)', city: 'São Paulo', fee: 9.00 },
  { id: '3', name: 'Espírito Santo / Vila Velha', city: 'Vila Velha', cepPrefix: '29', fee: 7.00 },
  { id: '4', name: 'Rio de Janeiro', city: 'Rio de Janeiro', cepPrefix: '20', fee: 12.00 },
  { id: '5', name: 'Outras Regiões (Taxa Padrão)', fee: 10.00 },
];

// Carrega as taxas salvas
export function getDeliveryRates(): DeliveryRegion[] {
  if (typeof window === 'undefined') return DEFAULT_DELIVERY_REGIONS;
  const saved = localStorage.getItem('garagem_delivery_rates');
  if (!saved) return DEFAULT_DELIVERY_REGIONS;
  try {
    return JSON.parse(saved);
  } catch {
    return DEFAULT_DELIVERY_REGIONS;
  }
}

// Salva as taxas alteradas pelo Admin
export function saveDeliveryRates(rates: DeliveryRegion[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('garagem_delivery_rates', JSON.stringify(rates));
  }
}

// Calcula a taxa ideal para a cidade / CEP pesquisado
export function calculateFeeForAddress(city: string, cep: string): number {
  const rates = getDeliveryRates();
  const cleanCep = cep.replace(/\D/g, '');
  const prefix = cleanCep.substring(0, 2);

  // 1. Busca por Prefixo do CEP
  const byCep = rates.find((r) => r.cepPrefix && cleanCep.startsWith(r.cepPrefix));
  if (byCep) return byCep.fee;

  // 2. Busca por Nome da Cidade
  const byCity = rates.find((r) => r.city && city.toLowerCase().includes(r.city.toLowerCase()));
  if (byCity) return byCity.fee;

  // 3. Retorna a Taxa Padrão
  const defaultRate = rates.find((r) => r.id === '5' || r.name.toLowerCase().includes('padrão'));
  return defaultRate ? defaultRate.fee : 10.00;
}