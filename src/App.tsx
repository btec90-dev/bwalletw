import React, { useState, useEffect } from 'react';
import { Transaction, Payee, Budget, UserAccount, AppSettings, CurrencyCode, LanguageCode } from './types';
import { StorageService } from './services/storage';
import { CURRENCIES, CATEGORIES, PAYMENT_METHODS } from './constants';
import { AuthScreen } from './components/AuthScreen';
import { PinLockScreen } from './components/PinLockScreen';
import { QuickAddModal } from './components/QuickAddModal';
import { SyncHealthModal } from './components/SyncHealthModal';
import { AnalyticsView } from './components/AnalyticsView';
import { BudgetsView } from './components/BudgetsView';
import { PayeesView } from './components/PayeesView';
import { SecuritySettingsView } from './components/SecuritySettingsView';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Plus, 
  Cloud, 
  CloudOff, 
  Lock, 
  Shield, 
  Users, 
  BarChart3, 
  Home as HomeIcon, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Smartphone
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserAccount>(StorageService.getUser());
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [transactions, setTransactions] = useState<Transaction[]>(StorageService.getTransactions());
  const [payees, setPayees] = useState<Payee[]>(StorageService.getPayees());
  const [budgets, setBudgets] = useState<Budget[]>(StorageService.getBudgets());

  const [activeTab, setActiveTab] = useState<'home' | 'analytics' | 'budgets' | 'payees' | 'security'>('home');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');

  // Sync state changes to localStorage
  useEffect(() => {
    StorageService.saveUser(user);
  }, [user]);

  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    StorageService.saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    StorageService.savePayees(payees);
  }, [payees]);

  useEffect(() => {
    StorageService.saveBudgets(budgets);
  }, [budgets]);

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt' | 'synced'>,
    savePayeeToDirectory: boolean
  ) => {
    const isOnline = navigator.onLine && !settings.isSimulatedOffline;
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      createdAt: Date.now(),
      synced: isOnline,
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (savePayeeToDirectory || txData.payeeName) {
      const existingPayeeIndex = payees.findIndex(
        (p) => p.name.toLowerCase() === txData.payeeName.toLowerCase()
      );

      if (existingPayeeIndex >= 0) {
        const updated = [...payees];
        updated[existingPayeeIndex] = {
          ...updated[existingPayeeIndex],
          category: txData.category,
          subcategory: txData.subcategory,
          preferredPaymentMethod: txData.paymentMethod,
          defaultCurrency: txData.currency,
          lastAmount: txData.amount,
          frequencyCount: updated[existingPayeeIndex].frequencyCount + 1,
          updatedAt: Date.now(),
        };
        setPayees(updated);
      } else if (savePayeeToDirectory) {
        const newPayee: Payee = {
          id: `payee-${Date.now()}`,
          name: txData.payeeName,
          category: txData.category,
          subcategory: txData.subcategory,
          preferredPaymentMethod: txData.paymentMethod,
          defaultCurrency: txData.currency,
          lastAmount: txData.amount,
          frequencyCount: 1,
          updatedAt: Date.now(),
        };
        setPayees((prev) => [newPayee, ...prev]);
      }
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveBudget = (budget: Budget) => {
    const existingIndex = budgets.findIndex((b) => b.id === budget.id);
    if (existingIndex >= 0) {
      const updated = [...budgets];
      updated[existingIndex] = budget;
      setBudgets(updated);
    } else {
      setBudgets((prev) => [budget, ...prev]);
    }
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSavePayee = (payee: Payee) => {
    const existingIndex = payees.findIndex((p) => p.id === payee.id);
    if (existingIndex >= 0) {
      const updated = [...payees];
      updated[existingIndex] = payee;
      setPayees(updated);
    } else {
      setPayees((prev) => [payee, ...prev]);
    }
  };

  const handleDeletePayee = (id: string) => {
    setPayees((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSyncNow = () => {
    setTransactions((prev) => prev.map((t) => ({ ...t, synced: true })));
    setIsSyncModalOpen(false);
  };

  const handleWipeData = () => {
    StorageService.wipeAllData();
    setUser({ email: '410bala@gmail.com', name: 'Bala Balatec', isLoggedIn: true, pinCode: '1234', isLocked: false });
    setTransactions(StorageService.getTransactions());
    setPayees(StorageService.getPayees());
    setBudgets(StorageService.getBudgets());
  };

  const pendingSyncCount = transactions.filter((t) => !t.synced).length;
  const isOnline = navigator.onLine && !settings.isSimulatedOffline;
  const currencySymbol = CURRENCIES.find((c) => c.code === settings.currency)?.symbol || 'CFA';

  const activeCurrencyRate = CURRENCIES.find((c) => c.code === settings.currency)?.rateToXof || 1;
  const convertToActive = (amount: number, fromCurrency: CurrencyCode) => {
    const fromRate = CURRENCIES.find((c) => c.code === fromCurrency)?.rateToXof || 1;
    return (amount * fromRate) / activeCurrencyRate;
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

  // Authentication check
  if (!user.isLoggedIn) {
    return <AuthScreen onLoginSuccess={(u) => setUser(u)} />;
  }

  // PIN Lock check
  if (user.isLocked) {
    return (
      <PinLockScreen
        correctPin={user.pinCode || '1234'}
        userName={user.name}
        onUnlock={() => setUser({ ...user, isLocked: false })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f0] text-[#2c221e] font-sans selection:bg-[#92400e] selection:text-white pb-24">
      
      {/* Mobile-First Sticky Header */}
      <header className="bg-[#5c3a21] text-[#fdfaf6] shadow-md px-3.5 py-3 sticky top-0 z-40 border-b border-[#784f31]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#784f31] border border-[#a16c45] flex items-center justify-center shadow-inner">
              <span className="font-serif text-lg font-bold text-[#fdfaf6]">B</span>
            </div>
            <div>
              <h1 className="font-serif text-sm sm:text-base font-bold tracking-wide leading-tight">Balatec Wallet</h1>
              <p className="text-[10px] text-[#e6dec9] tracking-wider">Mobile App Edition</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                isOnline
                  ? 'bg-emerald-900/40 text-emerald-200 border-emerald-700/60'
                  : 'bg-amber-900/40 text-amber-200 border-amber-700/60'
              }`}
            >
              {isOnline ? <Cloud size={12} className="text-emerald-400" /> : <CloudOff size={12} className="text-amber-400" />}
              <span>{isOnline ? 'Sync' : 'Hors-ligne'}</span>
              {pendingSyncCount > 0 && (
                <span className="bg-amber-500 text-stone-950 px-1 py-0.2 rounded-full text-[9px] font-mono font-bold">
                  {pendingSyncCount}
                </span>
              )}
            </button>

            <select
              value={settings.currency}
              onChange={(e) => handleUpdateSettings({ currency: e.target.value as CurrencyCode })}
              className="px-2 py-1 bg-[#452b18] border border-[#784f31] text-[#fdfaf6] rounded-lg text-[11px] font-semibold focus:outline-none cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>

            <button
              onClick={() => setUser({ ...user, isLocked: true })}
              className="p-1.5 bg-[#452b18] border border-[#784f31] text-[#fdfaf6] rounded-lg transition cursor-pointer"
              title="Verrouiller"
            >
              <Lock size={14} />
            </button>
          </div>

        </div>
      </header>

      {/* Main Container Optimized for Mobile Site */}
      <main className="max-w-md mx-auto px-3.5 py-4 space-y-4">
        
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            
            {/* Hero Balance & Summary Cards */}
            <div className="grid grid-cols-1 gap-3">
              
              <div className="bg-gradient-to-br from-[#5c3a21] to-[#3a2313] text-[#fdfaf6] p-4 sm:p-5 rounded-2xl shadow-md border border-[#784f31] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <span className="text-sm uppercase tracking-widest text-[#d4af37] font-semibold block mb-1">Solde Net Total</span>
                <div className="font-serif text-lg sm:text-xl font-bold tracking-tight font-mono mb-1.5">
                  {netBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currencySymbol}
                </div>
                <div className="text-[11px] text-[#e6dec9] flex items-center gap-1">
                  <Sparkles size={11} className="text-[#d4af37]" />
                  <span>Chiffrement local IndexedDB actif</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-xl shadow-xs border border-[#e2d6c3] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Revenus</span>
                    <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <ArrowDownLeft size={12} />
                    </div>
                  </div>
                  <div className="font-serif text-base font-bold text-emerald-800 font-mono">
                    +{totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <span className="text-[10px] text-stone-400 mt-0.5">Encaissements</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl shadow-xs border border-[#e2d6c3] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Dépenses</span>
                    <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-800 flex items-center justify-center">
                      <ArrowUpRight size={12} />
                    </div>
                  </div>
                  <div className="font-serif text-base font-bold text-rose-800 font-mono">
                    -{totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <span className="text-[10px] text-stone-400 mt-0.5">Charges & Sorties</span>
                </div>
              </div>

            </div>

            {/* Recent Ledger Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#e2d6c3] overflow-hidden">
              <div className="p-3.5 border-b border-[#e2d6c3] flex flex-wrap items-center justify-between gap-2 bg-[#fbf9f5]">
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#5c3a21]">Transactions Récentes</h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-stone-400">
                      <Search size={12} />
                    </span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Rechercher..."
                      className="pl-7 pr-3 py-1 bg-white rounded-lg border border-stone-300 text-[11px] text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#5c3a21] w-28 sm:w-auto"
                    />
                  </div>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="p-8 text-center text-stone-400 text-xs">
                  Aucune transaction récente.
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {filteredTransactions.map((tx) => {
                    const isExpense = tx.type === 'expense';
                    const isIncome = tx.type === 'income';

                    return (
                      <div key={tx.id} className="p-3 flex items-center justify-between gap-3 hover:bg-stone-50 transition">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
                              isExpense ? 'bg-rose-100 text-rose-800' : isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isExpense ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-stone-900 text-xs">{tx.payeeName}</span>
                              {!tx.synced ? (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-100 text-amber-800">
                                  En attente
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700">
                                  Sync
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-stone-500 mt-0.5">
                              {tx.category} • {tx.date}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`font-mono text-xs font-bold ${
                              isExpense ? 'text-rose-700' : isIncome ? 'text-emerald-700' : 'text-blue-700'
                            }`}
                          >
                            {isExpense ? '-' : isIncome ? '+' : ''}{tx.amount.toLocaleString()} {tx.currency}
                          </span>

                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <AnalyticsView transactions={transactions} settings={settings} onDeleteTransaction={handleDeleteTransaction} />
          </div>
        )}

        {/* BUDGETS TAB */}
        {activeTab === 'budgets' && (
          <div className="space-y-4">
            <BudgetsView
              budgets={budgets}
              transactions={transactions}
              settings={settings}
              onSaveBudget={handleSaveBudget}
              onDeleteBudget={handleDeleteBudget}
            />
          </div>
        )}

        {/* PAYEES TAB */}
        {activeTab === 'payees' && (
          <div className="space-y-4">
            <PayeesView
              payees={payees}
              onSavePayee={handleSavePayee}
              onDeletePayee={handleDeletePayee}
              settings={settings}
            />
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <SecuritySettingsView
              user={user}
              settings={settings}
              onUpdateUser={(u) => setUser(u)}
              onUpdateSettings={handleUpdateSettings}
              onWipeData={handleWipeData}
              onLogout={() => setUser({ ...user, isLoggedIn: false })}
            />
          </div>
        )}

      </main>

      {/* Sticky Bottom Navigation Sheet for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e2d6c3] px-3 py-1.5 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition cursor-pointer ${
              activeTab === 'home' ? 'text-[#5c3a21] font-bold scale-105' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <HomeIcon size={18} />
            <span className="text-[9px]">Accueil</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition cursor-pointer ${
              activeTab === 'analytics' ? 'text-[#5c3a21] font-bold scale-105' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <BarChart3 size={18} />
            <span className="text-[9px]">Analytique</span>
          </button>

          {/* Quick Add Floating Button in Nav */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex flex-col items-center justify-center -mt-5 bg-[#5c3a21] hover:bg-[#452b18] text-white w-12 h-12 rounded-full shadow-lg transition transform hover:scale-105 cursor-pointer border-3 border-white"
            title="Ajout Rapide"
          >
            <Plus size={24} />
          </button>

          <button
            onClick={() => setActiveTab('budgets')}
            className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition cursor-pointer ${
              activeTab === 'budgets' ? 'text-[#5c3a21] font-bold scale-105' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Wallet size={18} />
            <span className="text-[9px]">Budgets</span>
          </button>

          <button
            onClick={() => setActiveTab('payees')}
            className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition cursor-pointer ${
              activeTab === 'payees' ? 'text-[#5c3a21] font-bold scale-105' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Users size={18} />
            <span className="text-[9px]">Bénéficiaires</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex flex-col items-center gap-0.5 p-1 rounded-xl transition cursor-pointer ${
              activeTab === 'security' ? 'text-[#5c3a21] font-bold scale-105' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Shield size={18} />
            <span className="text-[9px]">Sécurité</span>
          </button>

        </div>
      </nav>

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSaveTransaction={handleSaveTransaction}
        payees={payees}
        settings={settings}
      />

      <SyncHealthModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        transactions={transactions}
        isSimulatedOffline={settings.isSimulatedOffline}
        onToggleOffline={() => handleUpdateSettings({ isSimulatedOffline: !settings.isSimulatedOffline })}
        onSyncNow={handleSyncNow}
      />

    </div>
  );
}
