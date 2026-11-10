import React, { useState } from 'react';
import { Budget, Transaction, AppSettings } from '../types';
import { CURRENCIES, CATEGORIES, TRANSLATIONS } from '../constants';
import { Wallet, Plus, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

interface BudgetsViewProps {
  budgets: Budget[];
  transactions: Transaction[];
  settings: AppSettings;
  onSaveBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  transactions,
  settings,
  onSaveBudget,
  onDeleteBudget,
}) => {
  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.en;
  const currencySymbol = CURRENCIES.find((c) => c.code === settings.currency)?.symbol || 'FCFA';

  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [limitAmount, setLimitAmount] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limitAmount) return;

    const newBudget: Budget = {
      id: `budget-${Date.now()}`,
      category,
      limitAmount: parseFloat(limitAmount),
      currency: settings.currency,
      period: 'monthly',
    };

    onSaveBudget(newBudget);
    setLimitAmount('');
    setShowAdd(false);
  };

  const expenses = transactions.filter((tx) => tx.type === 'expense');

  return (
    <div className="space-y-6 pb-24">
      
      {/* Top Header */}
      <div className="leather-card rounded-2xl p-6 bg-white border border-[#e6dec9] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-brand text-2xl font-bold text-[#5c3a21]">Budgets & Spending Limits</h2>
          <p className="text-xs text-stone-500">Track monthly limits across family, housing, and essentials</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="py-2.5 px-4 bg-[#5c3a21] hover:bg-[#452b18] text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <Plus size={16} />
          <span>Set New Budget</span>
        </button>
      </div>

      {/* Add Budget Form Modal / Card */}
      {showAdd && (
        <div className="leather-card rounded-2xl p-6 bg-white border border-[#e6dec9] shadow-lg">
          <h3 className="font-serif-brand text-lg font-bold text-stone-800 mb-4">Configure Category Budget</h3>
          <form onSubmit={handleAddBudget} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">{t.category}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Monthly Limit Amount</label>
              <input
                type="number"
                required
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                placeholder="e.g. 150000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#5c3a21] text-white text-xs font-semibold rounded-xl shadow-md hover:bg-[#452b18] transition cursor-pointer"
              >
                Save Budget
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((b) => {
          const spent = expenses
            .filter((tx) => tx.category === b.category)
            .reduce((sum, tx) => sum + tx.amount, 0);

          const percentage = Math.min(100, (spent / b.limitAmount) * 100);
          const isOver = spent > b.limitAmount;

          return (
            <div key={b.id} className="leather-card rounded-2xl p-6 bg-white border border-[#e6dec9] shadow-md relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5c3a21]/10 text-[#5c3a21] flex items-center justify-center">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h4 className="font-serif-brand font-bold text-stone-800 text-base">{b.category}</h4>
                    <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">Monthly Limit</span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteBudget(b.id)}
                  className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs text-stone-500">Spent: <strong className="font-mono text-stone-900">{spent.toLocaleString()} {currencySymbol}</strong></span>
                <span className="text-xs text-stone-500">Limit: <strong className="font-mono text-stone-900">{b.limitAmount.toLocaleString()} {currencySymbol}</strong></span>
              </div>

              <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-rose-600' : percentage > 80 ? 'bg-amber-500' : 'bg-emerald-600'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                {isOver ? (
                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle size={14} /> Over budget by {(spent - b.limitAmount).toLocaleString()} {currencySymbol}
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle size={14} /> {(b.limitAmount - spent).toLocaleString()} {currencySymbol} remaining
                  </span>
                )}
                <span className="font-mono text-stone-500">{percentage.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
