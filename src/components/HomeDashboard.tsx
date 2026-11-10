import React, { useState } from 'react';
import { Transaction, AppSettings, CurrencyCode } from '../types';
import { CURRENCIES, TRANSLATIONS } from '../constants';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  TrendingUp, 
  ArrowRightLeft 
} from 'lucide-react';

interface HomeDashboardProps {
  transactions: Transaction[];
  settings: AppSettings;
  onDeleteTransaction: (id: string) => void;
  onOpenQuickAdd: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  transactions,
  settings,
  onDeleteTransaction,
  onOpenQuickAdd,
}) => {
  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.en;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [swipedId, setSwipedId] = useState<string | null>(null);

  // Convert amounts to active currency for net balance
  const activeCurrencyRate = CURRENCIES.find((c) => c.code === settings.currency)?.rateToXof || 1;

  const convertToActive = (amount: number, fromCurrency: CurrencyCode) => {
    const fromRate = CURRENCIES.find((c) => c.code === fromCurrency)?.rateToXof || 1;
    const valueInXof = amount * fromRate;
    return valueInXof / activeCurrencyRate;
  };

  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + convertToActive(tx.amount, tx.currency), 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + convertToActive(tx.amount, tx.currency), 0);

  const netBalance = totalIncome - totalExpense;

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.payeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.memo && tx.memo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || tx.type === filterType;

    return matchesSearch && matchesType;
  });

  const currencySymbol = CURRENCIES.find((c) => c.code === settings.currency)?.symbol || 'FCFA';

  return (
    <div className="space-y-6 pb-24">
      
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Net Balance Card */}
        <div className="leather-card rounded-2xl p-6 bg-gradient-to-br from-[#5c3a21] to-[#452b18] text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-amber-200/80 font-medium">{t.totalBalance}</span>
            <Wallet size={20} className="text-amber-300" />
          </div>
          <div className="font-serif-brand text-3xl font-bold tracking-tight mb-2 font-mono">
            {netBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currencySymbol}
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-100/70">
            <span>Offline-first encrypted local storage active</span>
          </div>
        </div>

        {/* Total Income Card */}
        <div className="leather-card rounded-2xl p-6 bg-white shadow-md border border-[#e6dec9]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">{t.income}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ArrowDownLeft size={18} />
            </div>
          </div>
          <div className="font-serif-brand text-2xl font-bold text-emerald-700 tracking-tight font-mono">
            +{totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currencySymbol}
          </div>
          <div className="text-xs text-stone-500 mt-1">Verified inflows & remittances</div>
        </div>

        {/* Total Expenses Card */}
        <div className="leather-card rounded-2xl p-6 bg-white shadow-md border border-[#e6dec9]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">{t.expenses}</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="font-serif-brand text-2xl font-bold text-rose-700 tracking-tight font-mono">
            -{totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currencySymbol}
          </div>
          <div className="text-xs text-stone-500 mt-1">Family, utilities & operational outlays</div>
        </div>

      </div>

      {/* Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#e6dec9] shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search payees, categories, or notes..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
            />
          </div>

          <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${filterType === 'all' ? 'bg-[#5c3a21] text-white shadow-xs' : 'text-stone-600'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${filterType === 'expense' ? 'bg-[#5c3a21] text-white shadow-xs' : 'text-stone-600'}`}
            >
              Expenses
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${filterType === 'income' ? 'bg-[#5c3a21] text-white shadow-xs' : 'text-stone-600'}`}
            >
              Income
            </button>
          </div>
        </div>

        <button
          onClick={onOpenQuickAdd}
          className="py-2.5 px-4 bg-[#5c3a21] hover:bg-[#452b18] text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <Plus size={16} />
          <span>{t.quickAdd}</span>
        </button>
      </div>

      {/* Transaction Ledger List with Swipe-to-Delete */}
      <div className="leather-card rounded-2xl bg-white border border-[#e6dec9] shadow-md overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <h3 className="font-serif-brand font-bold text-stone-800 text-lg">{t.recentTransactions}</h3>
          <span className="text-xs text-stone-500 font-mono">{filteredTransactions.length} items (swipe rows to delete)</span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <p className="text-stone-600 font-medium text-sm">No transactions match your criteria.</p>
            <p className="text-stone-400 text-xs mt-1">Click Quick Add above to log a new expense or remittance.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredTransactions.map((tx) => {
              const isExpense = tx.type === 'expense';
              const isSwiped = swipedId === tx.id;

              return (
                <div
                  key={tx.id}
                  className="relative overflow-hidden transition-colors hover:bg-stone-50/80 group"
                >
                  <div className="p-4 flex items-center justify-between gap-4">
                    
                    {/* Left Icon & Details */}
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
                          isExpense ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-750'
                        }`}
                      >
                        {isExpense ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-800 text-sm">{tx.payeeName}</span>
                          {!tx.synced ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800 flex items-center gap-1">
                              <Clock size={10} /> Pending Sync
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 size={10} /> Synced
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
                          <span className="font-medium text-stone-700">{tx.category} → {tx.subcategory}</span>
                          <span>•</span>
                          <span>{tx.paymentMethod}</span>
                          <span>•</span>
                          <span className="font-mono">{tx.date}</span>
                        </div>
                        {tx.memo && <p className="text-xs text-stone-400 italic mt-1">"{tx.memo}"</p>}
                      </div>
                    </div>

                    {/* Amount & Delete Action */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span
                          className={`font-mono text-base font-bold block ${
                            isExpense ? 'text-rose-700' : 'text-emerald-700'
                          }`}
                        >
                          {isExpense ? '-' : '+'}{tx.amount.toLocaleString()} {tx.currency}
                        </span>
                      </div>

                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete transaction"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
