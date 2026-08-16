export interface LoyaltyCustomer {
  id: string;
  fullName: string;
  phone: string;
  birthDate: string; // Data de nascimento para promoções de aniversário
  points: number;
  totalSpent: number;
  lastOrderDate: string;
  createdAt: string;
}

const STORAGE_LOYALTY = 'garagem_loyalty_customers';

export function getLoyaltyCustomers(): LoyaltyCustomer[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_LOYALTY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function registerLoyaltyCustomer(data: {
  fullName: string;
  phone: string;
  birthDate: string;
}): LoyaltyCustomer {
  const customers = getLoyaltyCustomers();
  const cleanPhone = data.phone.replace(/\D/g, '');

  const existingIndex = customers.findIndex((c) => c.phone.replace(/\D/g, '') === cleanPhone);

  if (existingIndex >= 0) {
    return customers[existingIndex];
  }

  const newCustomer: LoyaltyCustomer = {
    id: Date.now().toString(),
    fullName: data.fullName.trim(),
    phone: data.phone,
    birthDate: data.birthDate,
    points: 10, // Bônus de boas-vindas
    totalSpent: 0,
    lastOrderDate: new Date().toLocaleDateString('pt-BR'),
    createdAt: new Date().toLocaleDateString('pt-BR'),
  };

  customers.push(newCustomer);
  if (typeof window === 'undefined') return newCustomer;
  localStorage.setItem(STORAGE_LOYALTY, JSON.stringify(customers));
  return newCustomer;
}