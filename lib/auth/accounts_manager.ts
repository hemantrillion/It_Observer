'use client';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  country?: string;
}

export const DEFAULT_TEST_USER: UserAccount = {
  id: 'usr_test_001',
  name: 'Test User',
  email: 'xyztestuser@gmail.com',
  avatarUrl: '/infra_trace_logo.png',
  role: 'Admin',
  company: 'InfraTrace Internal',
  jobTitle: 'Observability Lead',
  country: 'India',
};

const STORAGE_ACCOUNTS_KEY = 'infratrace_accounts_list';
const STORAGE_ACTIVE_KEY = 'infratrace_active_account_email';

export function getStoredAccounts(): UserAccount[] {
  if (typeof window === 'undefined') return [DEFAULT_TEST_USER];
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify([DEFAULT_TEST_USER]));
      return [DEFAULT_TEST_USER];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_TEST_USER];
  } catch {
    return [DEFAULT_TEST_USER];
  }
}

export function getActiveAccount(): UserAccount {
  if (typeof window === 'undefined') return DEFAULT_TEST_USER;
  try {
    const accounts = getStoredAccounts();
    const activeEmail = localStorage.getItem(STORAGE_ACTIVE_KEY);
    const found = accounts.find((a) => a.email.toLowerCase() === activeEmail?.toLowerCase());
    return found || accounts[0] || DEFAULT_TEST_USER;
  } catch {
    return DEFAULT_TEST_USER;
  }
}

export function setActiveAccount(account: UserAccount) {
  if (typeof window === 'undefined') return;
  const accounts = getStoredAccounts();
  const exists = accounts.some((a) => a.email.toLowerCase() === account.email.toLowerCase());
  const updated = exists
    ? accounts.map((a) => (a.email.toLowerCase() === account.email.toLowerCase() ? { ...a, ...account } : a))
    : [...accounts, account];

  localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(updated));
  localStorage.setItem(STORAGE_ACTIVE_KEY, account.email);
}

export function removeAccount(email: string): UserAccount | null {
  if (typeof window === 'undefined') return null;
  const accounts = getStoredAccounts().filter((a) => a.email.toLowerCase() !== email.toLowerCase());
  localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));

  if (accounts.length > 0) {
    localStorage.setItem(STORAGE_ACTIVE_KEY, accounts[0].email);
    return accounts[0];
  } else {
    localStorage.removeItem(STORAGE_ACTIVE_KEY);
    return null;
  }
}

export function clearAllAccounts() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_ACCOUNTS_KEY);
  localStorage.removeItem(STORAGE_ACTIVE_KEY);
}
