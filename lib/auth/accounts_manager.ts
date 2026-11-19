'use client';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  profilePicture?: string;
  authProvider?: string;
  providerUserId?: string;
  role?: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  country?: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_ADMIN_EMAIL = 'jai18hemant334@gmail.com';

export const DEFAULT_ADMIN_USER: UserAccount = {
  id: 'usr_admin_jai18',
  name: 'Hemant Kumar',
  email: DEFAULT_ADMIN_EMAIL,
  avatarUrl: '/avatars/hemant_kumar.jpg',
  profilePicture: '/avatars/hemant_kumar.jpg',
  authProvider: 'google',
  role: 'Super Admin',
  company: 'InfraTrace Internal',
  jobTitle: 'Observability Lead',
  country: 'India',
  permissions: ['VT1', 'EM1', 'PA1', 'CI1', 'UM1', 'SC1'],
};

export const GUEST_DEMO_USER: UserAccount = {
  id: 'usr_guest_demo',
  name: 'Demo Guest',
  email: 'guest.demo@infratrace.internal',
  avatarUrl: '/infra_trace_logo.png',
  profilePicture: '/infra_trace_logo.png',
  authProvider: 'demo',
  role: 'Demo',
  company: 'InfraTrace Playground',
  jobTitle: 'Evaluator',
  country: 'India',
  permissions: ['VT1'],
};

// Aliased for backward compatibility
export const DEFAULT_TEST_USER = GUEST_DEMO_USER;

const STORAGE_ACCOUNTS_KEY = 'infratrace_accounts_list';
const STORAGE_ACTIVE_KEY = 'infratrace_active_account_email';

export function isDefaultAdmin(account?: UserAccount | null): boolean {
  if (!account?.email) return false;
  return account.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
}

export function isSuperAdmin(account?: UserAccount | null): boolean {
  if (!account?.email) return false;
  if (isDefaultAdmin(account)) return true;
  return account.role === 'Super Admin';
}

export function sanitizeAccountRole(account: UserAccount): UserAccount {
  if (!account) return account;
  if (isDefaultAdmin(account)) {
    return {
      ...account,
      role: 'Super Admin',
      permissions: ['VT1', 'EM1', 'PA1', 'CI1', 'UM1', 'SC1'],
    };
  }
  if (account.role === 'Super Admin' || account.role === 'Admin') {
    return {
      ...account,
      role: account.role,
      permissions: ['VT1', 'EM1', 'PA1', 'CI1', 'UM1', 'SC1'],
    };
  }
  if (account.role === 'Demo') return account;
  return {
    ...account,
    role: 'Normal User',
    permissions: account.permissions && account.permissions.length > 0 ? account.permissions : ['VT1'],
  };
}

export function hasPermission(account: UserAccount | null | undefined, permissionCode: string): boolean {
  if (!account) return false;
  if (account.role === 'Admin' || isDefaultAdmin(account)) return true;
  if (account.role === 'Demo') return permissionCode === 'VT1' || permissionCode === 'V-TEL';
  if (Array.isArray(account.permissions) && account.permissions.length > 0) {
    return account.permissions.includes(permissionCode);
  }
  return permissionCode === 'VT1' || permissionCode === 'V-TEL';
}

export function canManageUsers(account: UserAccount | null | undefined): boolean {
  if (!account) return false;
  if (isSuperAdmin(account)) return true;
  return account.role === 'Admin';
}

export function getStoredAccounts(): UserAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Demo guest is NEVER treated as a stored account
    const filtered = parsed.filter(
      (a: any) => a.role !== 'Demo' && a.email?.toLowerCase() !== GUEST_DEMO_USER.email.toLowerCase()
    );
    // If multiple accounts existed, enforce single account in browser
    if (filtered.length > 1) {
      localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify([filtered[0]]));
      return [filtered[0]];
    }
    return filtered;
  } catch {
    return [];
  }
}

export function getActiveAccount(): UserAccount {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_USER;
  try {
    if (localStorage.getItem('infratrace_logged_out') === 'true') {
      return GUEST_DEMO_USER;
    }
    const activeEmail = localStorage.getItem(STORAGE_ACTIVE_KEY);
    if (activeEmail && activeEmail.toLowerCase() !== GUEST_DEMO_USER.email.toLowerCase()) {
      const accounts = getStoredAccounts();
      const found = accounts.find((a) => a.email.toLowerCase() === activeEmail.toLowerCase());
      if (found) return sanitizeAccountRole(found);
    }
    const accounts = getStoredAccounts();
    if (accounts.length > 0) return sanitizeAccountRole(accounts[0]);
    return GUEST_DEMO_USER;
  } catch {
    return GUEST_DEMO_USER;
  }
}

export function isUserAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (localStorage.getItem('infratrace_logged_out') === 'true') return false;
    const activeEmail = localStorage.getItem(STORAGE_ACTIVE_KEY);
    if (!activeEmail || activeEmail.toLowerCase() === GUEST_DEMO_USER.email.toLowerCase()) return false;
    const accounts = getStoredAccounts();
    return Boolean(accounts.some((a) => a.email.toLowerCase() === activeEmail.toLowerCase()));
  } catch {
    return false;
  }
}

export function setActiveAccount(account: UserAccount): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('infratrace_logged_out');
  } catch {
    // ignore
  }
  // Demo mode is NEVER stored as an account
  if (account.role === 'Demo' || account.email?.toLowerCase() === GUEST_DEMO_USER.email.toLowerCase()) {
    localStorage.setItem(STORAGE_ACTIVE_KEY, GUEST_DEMO_USER.email);
    return;
  }
  // Only one account is logged in browser at a time
  localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify([account]));
  localStorage.setItem(STORAGE_ACTIVE_KEY, account.email);
}

export function removeAccount(email: string): UserAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    localStorage.setItem('infratrace_logged_out', 'true');
    localStorage.removeItem(STORAGE_ACCOUNTS_KEY);
    localStorage.removeItem(STORAGE_ACTIVE_KEY);
  } catch {
    // ignore
  }
  return null;
}

export function clearAllAccounts(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('infratrace_logged_out', 'true');
    localStorage.removeItem(STORAGE_ACCOUNTS_KEY);
    localStorage.removeItem(STORAGE_ACTIVE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Validates session with backend server and persists verified user account
 */
export async function syncSessionFromServer(): Promise<UserAccount | null> {
  if (typeof window === 'undefined') return null;
  try {
    if (localStorage.getItem('infratrace_logged_out') === 'true') {
      return null;
    }
    const res = await fetch('/api/auth/session', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.authenticated && data.user) {
      setActiveAccount(data.user);
      return data.user;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Complete secure sign-out (clears server cookie + local storage)
 */
export async function signOutActiveAccount(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // continue cleanup
  }
  clearAllAccounts();
}
