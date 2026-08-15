export interface LoyaltySettings {
  pointsPerReal: number; // Ex: 1 ponto a cada R$ 1,00 gasto
  pointsToRedeem: number; // Ex: 50 pontos para resgatar
  rewardDiscount: number; // Ex: R$ 10,00 de desconto ao resgatar
}

export interface CustomerLoyalty {
  phone: string;
  name: string;
  points: number;
  totalSpent: number;
  ordersCount: number;
}

export const DEFAULT_LOYALTY_SETTINGS: LoyaltySettings = {
  pointsPerReal: 1, // R$ 1,00 = 1 ponto
  pointsToRedeem: 50, // 50 pontos
  rewardDiscount: 10, // R$ 10,00 de desconto
};

// 1. Obter configurações do programa de fidelidade
export function getLoyaltySettings(): LoyaltySettings {
  if (typeof window === 'undefined') return DEFAULT_LOYALTY_SETTINGS;
  const saved = localStorage.getItem('garagem_loyalty_settings');
  if (!saved) return DEFAULT_LOYALTY_SETTINGS;
  try {
    return JSON.parse(saved);
  } catch {
    return DEFAULT_LOYALTY_SETTINGS;
  }
}

// 2. Salvar configurações (Usado pelo Admin)
export function saveLoyaltySettings(settings: LoyaltySettings) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('garagem_loyalty_settings', JSON.stringify(settings));
  }
}

// 3. Obter lista de todos os clientes cadastrados no fidelidade
export function getAllCustomersLoyalty(): CustomerLoyalty[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('garagem_customers_loyalty');
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

// 4. Buscar dados de fidelidade de um cliente específico pelo Telefone
export function getCustomerLoyaltyByPhone(phone: string): CustomerLoyalty | null {
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone) return null;
  const customers = getAllCustomersLoyalty();
  return customers.find((c) => c.phone.replace(/\D/g, '') === cleanPhone) || null;
}

// 5. Adicionar pontos e salvar compra do cliente
export function addOrderPoints(name: string, phone: string, amountSpent: number, redeemedDiscount: boolean = false): number {
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone) return 0;

  const settings = getLoyaltySettings();
  const customers = getAllCustomersLoyalty();
  const pointsEarned = Math.floor(amountSpent * settings.pointsPerReal);

  const existingIndex = customers.findIndex((c) => c.phone.replace(/\D/g, '') === cleanPhone);

  if (existingIndex >= 0) {
    let newPoints = customers[existingIndex].points + pointsEarned;
    if (redeemedDiscount) {
      newPoints = Math.max(0, newPoints - settings.pointsToRedeem);
    }

    customers[existingIndex] = {
      ...customers[existingIndex],
      name: name || customers[existingIndex].name,
      points: newPoints,
      totalSpent: customers[existingIndex].totalSpent + amountSpent,
      ordersCount: customers[existingIndex].ordersCount + 1,
    };
  } else {
    customers.push({
      phone: cleanPhone,
      name: name || 'Cliente',
      points: pointsEarned,
      totalSpent: amountSpent,
      ordersCount: 1,
    });
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('garagem_customers_loyalty', JSON.stringify(customers));
  }

  return pointsEarned;
}

// 6. Atualizar pontos de um cliente manualmente (Usado pelo Admin)
export function updateCustomerPoints(phone: string, newPoints: number) {
  const cleanPhone = phone.replace(/\D/g, '');
  const customers = getAllCustomersLoyalty();
  const updated = customers.map((c) =>
    c.phone.replace(/\D/g, '') === cleanPhone ? { ...c, points: Math.max(0, newPoints) } : c
  );
  if (typeof window !== 'undefined') {
    localStorage.setItem('garagem_customers_loyalty', JSON.stringify(updated));
  }
}