import React, { useState, useEffect, useRef } from 'react';
import { Transaction, Payee, CurrencyCode, PaymentMethod, AppSettings } from '../types';
import { CATEGORIES, CURRENCIES, PAYMENT_METHODS, TRANSLATIONS } from '../constants';
import { X, Plus, Search, Check, Sparkles } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'synced'>, savePayee: boolean) => void;
  payees: Payee[];
  settings: AppSettings;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSaveTransaction,
  payees,
  settings,
}) => {
  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.en;

  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(settings.currency);
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [subcategory, setSubcategory] = useState(CATEGORIES[0].subcategories[0]);
  const [payeeName, setPayeeName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Mobile Money (Orange)');
  const [memo, setMemo] = useState('');
  const [savePayee, setSavePayee] = useState(false);
  const [selectedPayeeId, setSelectedPayeeId] = useState<string | undefined>();
  const [lastAmountPrompt, setLastAmountPrompt] = useState<number | null>(null);

  // Typeahead state
  const [showTypeahead, setShowTypeahead] = useState(false);
  const typeaheadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrency(settings.currency);
  }, [settings.currency, isOpen]);

  // Handle category change -> reset subcategory
  const handleCategoryChange = (catName: string) => {
    setCategory(catName);
    const found = CATEGORIES.find((c) => c.name === catName);
    if (found && found.subcategories.length > 0) {
      setSubcategory(found.subcategories[0]);
    } else {
      setSubcategory('');
    }
  };

  // Filtered payees for predictive typeahead
  const filteredPayees = payees.filter((p) =>
    p.name.toLowerCase().includes(payeeName.toLowerCase())
  );

  const handleSelectPayee = (payee: Payee) => {
    setPayeeName(payee.name);
    setSelectedPayeeId(payee.id);
    setCategory(payee.category);
    setSubcategory(payee.subcategory);
    setPaymentMethod(payee.preferredPaymentMethod);
    setCurrency(payee.defaultCurrency);
    if (payee.lastAmount) {
      setLastAmountPrompt(payee.lastAmount);
    }
    setShowTypeahead(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !payeeName) return;

    onSaveTransaction(
      {
        amount: parseFloat(amount),
        currency,
        type,
        category,
        subcategory,
        payeeId: selectedPayeeId,
        payeeName,
        paymentMethod,
        date: new Date().toISOString().split('T')[0],
        memo: memo.trim() ? memo : undefined,
      },
      savePayee
    );

    // Reset and close
    setAmount('');
    setPayeeName('');
    setMemo('');
    setSavePayee(false);
    setSelectedPayeeId(undefined);
    setLastAmountPrompt(null);
    onClose();
  };

  if (!isOpen) return null;

  const currentCategoryObj = CATEGORIES.find((c) => c.name === category);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-lg w-full leather-card rounded-3xl p-6 shadow-2xl bg-white border border-[#e6dec9] relative my-8">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-xl bg-stone-100 transition"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="font-serif-brand text-2xl font-bold text-[#5c3a21]">New Transaction Ledger</h2>
          <p className="text-xs text-stone-500">Log expense, income or transfer with smart payee recognition</p>
        </div>

        {/* Type selector */}
        <div className="grid grid-cols-3 gap-2 bg-stone-100 p-1 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              type === 'expense' ? 'bg-[#5c3a21] text-white shadow-sm' : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              type === 'income' ? 'bg-emerald-700 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setType('transfer')}
            className={`py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              type === 'transfer' ? 'bg-blue-700 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            Transfer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Amount & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">{t.amount}</label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 25000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">{t.currency}</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Last Amount Quick Prompt */}
          {lastAmountPrompt && (
            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between text-xs">
              <span className="text-amber-900 flex items-center gap-1.5 font-medium">
                <Sparkles size={14} className="text-amber-600" />
                Use last recorded amount: <strong className="font-mono">{lastAmountPrompt.toLocaleString()} {currency}</strong>?
              </span>
              <button
                type="button"
                onClick={() => setAmount(lastAmountPrompt.toString())}
                className="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 cursor-pointer"
              >
                Apply
              </button>
            </div>
          )}

          {/* Smart Payee Field with Typeahead */}
          <div className="relative" ref={typeaheadRef}>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">{t.payee}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                required
                value={payeeName}
                onChange={(e) => {
                  setPayeeName(e.target.value);
                  setShowTypeahead(true);
                  setSelectedPayeeId(undefined);
                }}
                onFocus={() => setShowTypeahead(true)}
                placeholder="Type payee (e.g. Sylvanus, Pharmacie, CIE)"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
              />
            </div>

            {/* Typeahead Dropdown */}
            {showTypeahead && payeeName.length >= 1 && filteredPayees.length > 0 && (
              <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                <div className="p-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400 bg-stone-50 border-b">
                  Saved Payees & Recipients Match
                </div>
                {filteredPayees.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => handleSelectPayee(p)}
                    className="w-full text-left px-4 py-2.5 hover:bg-amber-50/60 border-b border-stone-100 last:border-0 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-stone-800 text-sm block">{p.name}</span>
                      <span className="text-xs text-stone-500">{p.category} → {p.subcategory}</span>
                    </div>
                    {p.lastAmount && (
                      <span className="font-mono text-xs font-medium text-stone-600">
                        Last: {p.lastAmount.toLocaleString()} {p.defaultCurrency}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* In-Line Auto-Save Toggle */}
          <div className="flex items-center gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <input
              type="checkbox"
              id="savePayeeToggle"
              checked={savePayee}
              onChange={(e) => setSavePayee(e.target.checked)}
              className="w-4 h-4 text-[#5c3a21] rounded-md border-stone-300 focus:ring-[#5c3a21] cursor-pointer"
            />
            <label htmlFor="savePayeeToggle" className="text-xs font-medium text-stone-700 cursor-pointer">
              {t.savePayeeToggle} (Adds to Smart Directory for instant autocomplete)
            </label>
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">{t.category}</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">{t.subcategory}</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
              >
                {currentCategoryObj?.subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">{t.paymentMethod}</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Memo */}
          {settings.showMemoField && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">{t.memo}</label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Optional notes or reference number..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
              />
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium text-sm transition cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-[#5c3a21] hover:bg-[#452b18] text-white font-medium text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={18} />
              <span>{t.saveTransaction}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
