import { getStoreSettings } from './settings';

export function loginAdmin(password: string): boolean {
  const settings = getStoreSettings();
  if (password === settings.adminPassword) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('garagem_admin_session', 'true');
    }
    return true;
  }
  return false;
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('garagem_admin_session') === 'true';
}

export function logoutAdmin() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('garagem_admin_session');
  }
}