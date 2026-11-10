export type CurrencyCode = 'CFA' | 'USD' | 'CAD' | 'EUR';

export type LanguageCode = 'en' | 'fr' | 'es' | 'ar';

export type ThemeName = 'brown' | 'caramel' | 'emerald' | 'navy' | 'burgundy' | 'slate' | 'midnight' | 'obsidian';

export type PaymentMethod = 
  | 'Cash' 
  | 'Credit Card' 
  | 'Debit Card' 
  | 'Bank Transfer' 
  | 'Mobile Money (Orange)' 
  | 'Mobile Money (MTN)' 
  | 'Mobile Money (Moov)' 
  | 'Wire Transfer';

export interface Payee {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  preferredPaymentMethod: PaymentMethod;
  paymentIdentifier?: string; // phone number, IBAN, or address
  defaultCurrency: CurrencyCode;
  lastAmount?: number;
  frequencyCount: number;
  updatedAt: number;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: CurrencyCode;
  type: 'expense' | 'income' | 'transfer';
  category: string;
  subcategory: string;
  payeeId?: string;
  payeeName: string;
  paymentMethod: PaymentMethod;
  date: string; // ISO date string YYYY-MM-DD
  memo?: string;
  synced: boolean;
  createdAt: number;
}

export interface Budget {
  id: string;
  category: string;
  subcategory?: string;
  limitAmount: number;
  currency: CurrencyCode;
  period: 'monthly' | 'weekly';
}

export interface UserAccount {
  email: string;
  name: string;
  isLoggedIn: boolean;
  pinCode?: string;
  isLocked: boolean;
}

export interface AppSettings {
  theme: ThemeName;
  language: LanguageCode;
  currency: CurrencyCode;
  showMemoField: boolean;
  typographyScale: 'sm' | 'md' | 'lg';
  viewportMode: 'responsive' | 'mobile-frame';
  isSimulatedOffline: boolean;
}
