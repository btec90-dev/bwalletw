import { Transaction, Payee, Budget, UserAccount, AppSettings } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'balatec_wallet_transactions_v1',
  PAYEES: 'balatec_wallet_payees_v1',
  BUDGETS: 'balatec_wallet_budgets_v1',
  USER: 'balatec_wallet_user_v1',
  SETTINGS: 'balatec_wallet_settings_v1',
};

export const StorageService = {
  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveTransactions(txs: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  },

  getPayees(): Payee[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYEES);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  savePayees(payees: Payee[]): void {
    localStorage.setItem(STORAGE_KEYS.PAYEES, JSON.stringify(payees));
  },

  getBudgets(): Budget[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveBudgets(budgets: Budget[]): void {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  },

  getUser(): UserAccount {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (!data) {
        const defaultUser: UserAccount = {
          email: '410bala@gmail.com',
          name: 'Bala Balatec',
          isLoggedIn: true,
          pinCode: '1234',
          isLocked: false,
        };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultUser));
        return defaultUser;
      }
      return JSON.parse(data);
    } catch {
      return {
        email: '410bala@gmail.com',
        name: 'Bala Balatec',
        isLoggedIn: true,
        pinCode: '1234',
        isLocked: false,
      };
    }
  },

  saveUser(user: UserAccount): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        const defaultSettings: AppSettings = {
          theme: 'brown',
          language: 'fr',
          currency: 'CFA',
          showMemoField: true,
          typographyScale: 'md',
          viewportMode: 'responsive',
          isSimulatedOffline: false,
        };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
        return defaultSettings;
      }
      return JSON.parse(data);
    } catch {
      return {
        theme: 'brown',
        language: 'fr',
        currency: 'CFA',
        showMemoField: true,
        typographyScale: 'md',
        viewportMode: 'responsive',
        isSimulatedOffline: false,
      };
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  wipeAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.PAYEES);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PAYEES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
  },
};
