export interface StoreAccount {
  id: string;
  storeName: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

const STORAGE_ACCOUNTS = 'garagem_store_accounts';
const STORAGE_CURRENT_SESSION = 'garagem_active_store_session';

export function getRegisteredStores(): StoreAccount[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_ACCOUNTS);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function registerNewStore(storeName: string, email: string, password: string): { success: boolean; message: string } {
  const stores = getRegisteredStores();
  const cleanEmail = email.trim().toLowerCase();

  const existing = stores.find((s) => s.email === cleanEmail);
  if (existing) {
    return { success: false, message: 'Já existe uma loja cadastrada com este e-mail!' };
  }

  const newStore: StoreAccount = {
    id: Date.now().toString(),
    storeName,
    email: cleanEmail,
    passwordHash: password,
    createdAt: new Date().toLocaleDateString('pt-BR'),
  };

  stores.push(newStore);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(stores));
    localStorage.setItem(STORAGE_CURRENT_SESSION, JSON.stringify(newStore));
  }

  return { success: true, message: 'Loja cadastrada com sucesso!' };
}

export function loginStoreAccount(email: string, password: string): { success: boolean; message: string } {
  const stores = getRegisteredStores();
  const cleanEmail = email.trim().toLowerCase();

  const store = stores.find((s) => s.email === cleanEmail && s.passwordHash === password);

  if (!store) {
    return { success: false, message: 'E-mail ou senha incorretos!' };
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_CURRENT_SESSION, JSON.stringify(store));
  }

  return { success: true, message: 'Login realizado com sucesso!' };
}

export function getCurrentActiveStore(): StoreAccount | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(STORAGE_CURRENT_SESSION);
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    if (parsed && parsed.email) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function logoutStoreAccount() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_CURRENT_SESSION);
  }
}