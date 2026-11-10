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
  Sparkles
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
  const currencySymbol = CURRENCIES.find((c) => c.code === settings.currency)?.symbol || 'FCFA';

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
    <div className="min-h-screen bg-[#f8f5f0] text-[#2c221e] font-sans selection:bg-[#92400e] selection:text-white">
      
      {/* Top Luxury Leather Header */}
      <header className="bg-[#5c3a21] text-[#fdfaf6] shadow-md px-4 py-3.5 sticky top-0 z-40 border-b border-[#784f31]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#784f31] border border-[#a16c45] flex items-center justify-center shadow-inner">
              <span className="font-serif text-2xl font-bold tracking-wider text-[#fdfaf6]">B</span>
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold tracking-wide">Balatec Wallet</h1>
              <p className="text-[11px] text-[#e6dec9] tracking-wider uppercase">Saddle Tan & Calfskin Edition</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                isOnline
                  ? 'bg-emerald-900/40 text-emerald-200 border-emerald-700/60 hover:bg-emerald-900/60'
                  : 'bg-amber-900/40 text-amber-200 border-amber-700/60 hover:bg-amber-900/60'
              }`}
            >
              {isOnline ? <Cloud size={14} className="text-emerald-400" /> : <CloudOff size={14} className="text-amber-400" />}
              <span className="hidden sm:inline">{isOnline ? 'Synchronisé' : 'Hors-ligne'}</span>
              {pendingSyncCount > 0 && (
                <span className="bg-amber-500 text-stone-950 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold">
                  {pendingSyncCount}
                </span>
              )}
            </button>

            <select
              value={settings.currency}
              onChange={(e) => handleUpdateSettings({ currency: e.target.value as CurrencyCode })}
              className="px-2.5 py-1.5 bg-[#452b18] border border-[#784f31] text-[#fdfaf6] rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>

            <select
              value={settings.language}
              onChange={(e) => handleUpdateSettings({ language: e.target.value as LanguageCode })}
              className="px-2.5 py-1.5 bg-[#452b18] border border-[#784f31] text-[#fdfaf6] rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="es">ES</option>
              <option value="ar">AR</option>
            </select>

            <button
              onClick={() => setUser({ ...user, isLocked: true })}
              className="p-2 bg-[#452b18] border border-[#784f31] text-[#fdfaf6] hover:bg-[#321f12] rounded-xl transition cursor-pointer"
              title="Lock App"
            >
              <Lock size={16} />
            </button>
          </div>

        </div>
      </header>

      {/* Navigation Sub-Bar */}
      <nav className="bg-[#f0ebe1] border-b border-[#e2d6c3] px-4 py-2 sticky top-[65px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'home', label: 'Accueil & Journal', icon: HomeIcon },
              { id: 'analytics', label: 'Analytique & Rapports', icon: BarChart3 },
              { id: 'budgets', label: 'Budgets & Limites', icon: Wallet },
              { id: 'payees', label: 'Bénéficiaires', icon: Users },
              { id: 'security', label: 'Sécurité & Système', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#5c3a21] text-white shadow-sm'
                      : 'text-[#5c3a21] hover:bg-[#e6dec9]/60'
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="py-2 px-4 bg-[#92400e] hover:bg-[#78350f] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} />
            <span>+ Ajout Rapide</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            
            {/* Hero Balance & Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              <div className="bg-gradient-to-br from-[#5c3a21] to-[#3a2313] text-[#fdfaf6] p-4 sm:p-5 rounded-2xl shadow-md border border-[#784f31] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-[#d4af37] font-semibold block mb-1">Solde Net Total</span>
                <div className="font-serif text-xl sm:text-2xl font-bold tracking-tight font-mono mb-1.5">
                  {netBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currencySymbol}
                </div>
                <div className="text-[10px] text-[#e6dec9] flex items-center gap-1">
                  <Sparkles size={11} className="text-[#d4af37]" />
                  <span>Chiffrement local IndexedDB actif</span>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-[#e2d6c3] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-500 font-semibold">Revenus Totaux</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <ArrowDownLeft size={14} />
                  </div>
                </div>
                <div className="font-serif text-lg sm:text-xl font-bold text-emerald-800 font-mono">
                  +{totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currencySymbol}
                </div>
                <span className="text-[10px] text-stone-400 mt-1">Salaires, virements et encaissements</span>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-[#e2d6c3] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-stone-500 font-semibold">Dépenses Totales</span>
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
                    <ArrowUpRight size={14} />
                  </div>
                </div>
                <div className="font-serif text-lg sm:text-xl font-bold text-rose-800 font-mono">
                  -{totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currencySymbol}
                </div>
                <span className="text-[10px] text-stone-400 mt-1">Famille, utilitaires et charges</span>
              </div>

            </div>

            {/* Recent Ledger Section */}
            <div className="bg-white rounded-3xl shadow-md border border-[#e2d6c3] overflow-hidden">
              <div className="p-6 border-b border-[#e2d6c3] flex flex-wrap items-center justify-between gap-4 bg-[#fbf9f5]">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#5c3a21]">Journal des Transactions Récentes</h3>
                  <p className="text-xs text-stone-500">Toutes les opérations enregistrées en mode hors-ligne</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Rechercher..."
                      className="pl-9 pr-4 py-2 bg-white rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
                    />
                  </div>

                  <div className="flex bg-stone-200/70 p-1 rounded-xl text-xs font-semibold">
                    {(['all', 'expense', 'income'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-3 py-1.5 rounded-lg transition cursor-pointer capitalize ${
                          filterType === type ? 'bg-[#5c3a21] text-white shadow-xs' : 'text-stone-700'
                        }`}
                      >
                        {type === 'all' ? 'Tous' : type === 'expense' ? 'Dépenses' : 'Revenus'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="p-16 text-center text-stone-500 text-sm">
                  Aucune transaction ne correspond à votre recherche.
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {filteredTransactions.map((tx) => {
                    const isExpense = tx.type === 'expense';
                    const isIncome = tx.type === 'income';

                    return (
                      <div key={tx.id} className="p-5 flex items-center justify-between gap-4 hover:bg-stone-50/80 transition">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
                              isExpense ? 'bg-rose-100 text-rose-800' : isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isExpense ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900 text-base">{tx.payeeName}</span>
                              {!tx.synced ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800 flex items-center gap-1">
                                  <Clock size={10} /> En attente
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 flex items-center gap-1">
                                  <CheckCircle2 size={10} /> Synchronisé
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

                        <div className="flex items-center gap-6">
                          <span
                            className={`font-mono text-lg font-bold ${
                              isExpense ? 'text-rose-700' : isIncome ? 'text-emerald-700' : 'text-blue-700'
                            }`}
                          >
                            {isExpense ? '-' : isIncome ? '+' : ''}{tx.amount.toLocaleString()} {tx.currency}
                          </span>

                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-2.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
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

        {/* ANALYTICS & ALL TRANSACTIONS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <AnalyticsView transactions={transactions} settings={settings} onDeleteTransaction={handleDeleteTransaction} />
          </div>
        )}

        {/* BUDGETS TAB */}
        {activeTab === 'budgets' && (
          <div className="space-y-8">
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
          <div className="space-y-8">
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
          <div className="space-y-8">
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

      {/* Footer */}
      <footer className="bg-[#5c3a21] text-[#e6dec9] py-6 px-4 mt-16 border-t border-[#784f31] text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <span>Balatec Wallet — Offline-First Multi-Currency Ledger</span>
          <span>v1.4.2026 • Saddle Tan & Calfskin Edition</span>
          <span>Encrypted Local Storage (IndexedDB)</span>
        </div>
      </footer>

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
