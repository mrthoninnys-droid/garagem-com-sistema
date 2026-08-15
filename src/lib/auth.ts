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
  try {
    const saved = localStorage.getItem(STORAGE_ACCOUNTS);
    if (!saved) return [];
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function registerNewStore(
  storeName: string,
  email: string,
  password: string
): { success: boolean; message: string; store?: StoreAccount } {
  try {
    const stores = getRegisteredStores();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password || !storeName) {
      return { success: false, message: 'Preencha todos os campos corretamente.' };
    }

    const existing = stores.find((s) => s.email === cleanEmail);
    if (existing) {
      return { success: false, message: 'Já existe uma loja cadastrada com este e-mail!' };
    }

    const newStore: StoreAccount = {
      id: Date.now().toString(),
      storeName: storeName.trim(),
      email: cleanEmail,
      passwordHash: password,
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };

    stores.push(newStore);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(stores));
      localStorage.setItem(STORAGE_CURRENT_SESSION, JSON.stringify(newStore));
    }

    return { success: true, message: 'Loja cadastrada com sucesso!', store: newStore };
  } catch {
    return { success: false, message: 'Erro ao cadastrar loja. Tente novamente.' };
  }
}

export function loginStoreAccount(
  email: string,
  password: string
): { success: boolean; message: string; store?: StoreAccount } {
  try {
    const stores = getRegisteredStores();
    const cleanEmail = email.trim().toLowerCase();

    const store = stores.find((s) => s.email === cleanEmail && s.passwordHash === password);

    if (!store) {
      return { success: false, message: 'E-mail ou senha incorretos!' };
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_CURRENT_SESSION, JSON.stringify(store));
    }

    return { success: true, message: 'Login realizado com sucesso!', store };
  } catch {
    return { success: false, message: 'Erro ao realizar login. Tente novamente.' };
  }
}

export function getCurrentActiveStore(): StoreAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_CURRENT_SESSION);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed === 'object' && parsed.email && parsed.storeName) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function logoutStoreAccount() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_CURRENT_SESSION);
    } catch {
      // ignore
    }
  }
}