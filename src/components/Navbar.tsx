import React from 'react';
import { CurrencyCode, LanguageCode, ThemeName, AppSettings } from '../types';
import { CURRENCIES, TRANSLATIONS } from '../constants';
import { 
  Home, 
  BarChart3, 
  PlusCircle, 
  Wallet, 
  Users, 
  Shield, 
  Smartphone, 
  Monitor, 
  Cloud, 
  CloudOff, 
  Lock 
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenQuickAdd: () => void;
  onOpenSyncModal: () => void;
  onLockApp: () => void;
  pendingSyncCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onUpdateSettings,
  onOpenQuickAdd,
  onOpenSyncModal,
  onLockApp,
  pendingSyncCount,
}) => {
  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.en;
  const isOnline = navigator.onLine && !settings.isSimulatedOffline;

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[var(--card-bg,#ffffff)] border-b border-[var(--leather-border,#e6dec9)] shadow-xs px-3 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          {/* Brand Logo & Emblem */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#5c3a21] flex items-center justify-center text-white shadow-sm">
              <span className="font-serif-brand text-base font-bold">B</span>
            </div>
            <div>
              <h1 className="font-serif-brand text-base font-bold text-[#5c3a21] leading-tight">{t.appName}</h1>
            </div>
          </div>

          {/* Quick Controls: Currency, Language, Theme, Viewport, Sync status */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            
            {/* Sync Status Badge */}
            <button
              onClick={onOpenSyncModal}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
              title="Open Offline Sync Hub"
            >
              {isOnline ? <Cloud size={12} className="text-emerald-600" /> : <CloudOff size={12} className="text-amber-600" />}
              <span className="hidden md:inline">{isOnline ? t.synced : t.offlineMode}</span>
              {pendingSyncCount > 0 && (
                <span className="bg-amber-600 text-white px-1 py-0.2 rounded-full text-[9px] font-mono">
                  {pendingSyncCount}
                </span>
              )}
            </button>

            {/* Currency Selector */}
            <select
              value={settings.currency}
              onChange={(e) => onUpdateSettings({ currency: e.target.value as CurrencyCode })}
              className="px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-[11px] font-semibold text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#5c3a21] cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>

            {/* Language Selector */}
            <select
              value={settings.language}
              onChange={(e) => onUpdateSettings({ language: e.target.value as LanguageCode })}
              className="px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-[11px] font-semibold text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#5c3a21] cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="es">ES</option>
              <option value="ar">AR</option>
            </select>

            {/* Theme Picker */}
            <select
              value={settings.theme}
              onChange={(e) => onUpdateSettings({ theme: e.target.value as ThemeName })}
              className="px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-[11px] font-semibold text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#5c3a21] cursor-pointer hidden sm:block"
            >
              <option value="brown">Brown</option>
              <option value="caramel">Caramel</option>
              <option value="emerald">Emerald</option>
              <option value="navy">Navy</option>
              <option value="burgundy">Burgundy</option>
              <option value="slate">Slate</option>
              <option value="midnight">Midnight</option>
              <option value="obsidian">Obsidian</option>
            </select>

            {/* Viewport Switcher */}
            <button
              onClick={() =>
                onUpdateSettings({
                  viewportMode: settings.viewportMode === 'responsive' ? 'mobile-frame' : 'responsive',
                })
              }
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
              title="Toggle Viewport"
            >
              {settings.viewportMode === 'responsive' ? <Smartphone size={14} /> : <Monitor size={14} />}
            </button>

            {/* Lock Button */}
            <button
              onClick={onLockApp}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
              title="Lock Wallet"
            >
              <Lock size={14} />
            </button>

          </div>
        </div>
      </header>

      {/* Sticky Bottom Navigation Sheet for Mobile & Desktop */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--card-bg,#ffffff)]/95 backdrop-blur-md border-t border-[var(--leather-border,#e6dec9)] px-3 py-1.5 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'home' ? 'text-[#5c3a21] font-bold scale-105' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Home size={18} />
            <span className="text-[9px]">{t.home}</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'analytics' ? 'text-[#5c3a21] font-bold scale-105' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <BarChart3 size={18} />
            <span className="text-[9px]">{t.analytics}</span>
          </button>

          {/* Quick Add Floating Button in Nav */}
          <button
            onClick={onOpenQuickAdd}
            className="flex flex-col items-center justify-center -mt-5 bg-[#5c3a21] hover:bg-[#452b18] text-white w-12 h-12 rounded-full shadow-lg transition transform hover:scale-105 cursor-pointer border-3 border-white"
            title="Quick Add"
          >
            <PlusCircle size={24} />
          </button>

          <button
            onClick={() => setActiveTab('budgets')}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'budgets' ? 'text-[#5c3a21] font-bold scale-105' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Wallet size={18} />
            <span className="text-[9px]">{t.budgets}</span>
          </button>

          <button
            onClick={() => setActiveTab('payees')}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'payees' ? 'text-[#5c3a21] font-bold scale-105' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users size={18} />
            <span className="text-[9px]">{t.payees}</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'security' ? 'text-[#5c3a21] font-bold scale-105' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Shield size={18} />
            <span className="text-[9px]">{t.security}</span>
          </button>

        </div>
      </nav>
    </>
  );
};
