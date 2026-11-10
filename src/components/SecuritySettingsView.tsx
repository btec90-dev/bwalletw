import React, { useState } from 'react';
import { UserAccount, AppSettings } from '../types';
import { TRANSLATIONS } from '../constants';
import { Shield, Lock, User, RefreshCw, Trash2, Smartphone, Check, AlertTriangle } from 'lucide-react';

interface SecuritySettingsViewProps {
  user: UserAccount;
  settings: AppSettings;
  onUpdateUser: (newUser: UserAccount) => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onWipeData: () => void;
  onLogout: () => void;
}

export const SecuritySettingsView: React.FC<SecuritySettingsViewProps> = ({
  user,
  settings,
  onUpdateUser,
  onUpdateSettings,
  onWipeData,
  onLogout,
}) => {
  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.en;

  const [currentPin, setCurrentPin] = useState(user.pinCode || '1234');
  const [showPinSuccess, setShowPinSuccess] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  const handlePinChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPin.length === 4) {
      onUpdateUser({ ...user, pinCode: currentPin });
      setShowPinSuccess(true);
      setTimeout(() => setShowPinSuccess(false), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      
      {/* Top Header */}
      <div className="leather-card rounded-2xl p-6 bg-white border border-[#e6dec9]">
        <h2 className="font-serif-brand text-2xl font-bold text-[#5c3a21]">Security, PIN & Ledger Settings</h2>
        <p className="text-xs text-stone-500">Configure 4-digit PIN unlock, offline sync preferences, and user credentials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PIN Security Card */}
        <div className="leather-card rounded-2xl p-6 bg-white border border-[#e6dec9]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#5c3a21]/10 text-[#5c3a21] flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-serif-brand text-lg font-bold text-stone-800">{t.pinLock}</h3>
              <p className="text-xs text-stone-500">Tactile 4-digit on-screen numeric keypad security</p>
            </div>
          </div>

          <form onSubmit={handlePinChange} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">New 4-Digit PIN</label>
              <input
                type="text"
                maxLength={4}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#5c3a21] hover:bg-[#452b18] text-white text-xs font-semibold rounded-xl shadow-md transition cursor-pointer"
            >
              Update Security PIN
            </button>

            {showPinSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <Check size={16} /> PIN successfully updated.
              </div>
            )}
          </form>
        </div>

        {/* User Account & Session Card */}
        <div className="leather-card rounded-2xl p-6 bg-white border border-[#e6dec9] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#5c3a21]/10 text-[#5c3a21] flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-serif-brand text-lg font-bold text-stone-800">User Profile & Session</h3>
                <p className="text-xs text-stone-500">{user.email}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-xs text-stone-600">
              <div className="flex justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span>Account Holder</span>
                <strong className="text-stone-800">{user.name}</strong>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span>Authentication State</span>
                <strong className="text-emerald-700">Authenticated & Secure</strong>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition cursor-pointer"
          >
            {t.logout}
          </button>
        </div>

      </div>

      {/* Preferences & Ledger Toggles */}
      <div className="leather-card rounded-2xl p-6 bg-white border border-[#e6dec9]">
        <h3 className="font-serif-brand text-lg font-bold text-stone-800 mb-4">Ledger Preferences & Display</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <div>
              <span className="font-semibold text-stone-800 text-sm block">Show Transaction Memo Field</span>
              <span className="text-xs text-stone-500">Allow notes and reference numbers on quick add</span>
            </div>
            <input
              type="checkbox"
              checked={settings.showMemoField}
              onChange={(e) => onUpdateSettings({ showMemoField: e.target.checked })}
              className="w-5 h-5 text-[#5c3a21] rounded-md border-stone-300 focus:ring-[#5c3a21] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <div>
              <span className="font-semibold text-stone-800 text-sm block">Simulate Offline Network Mode</span>
              <span className="text-xs text-stone-500">Test offline queue persistence & IndexedDB synchronization</span>
            </div>
            <input
              type="checkbox"
              checked={settings.isSimulatedOffline}
              onChange={(e) => onUpdateSettings({ isSimulatedOffline: e.target.checked })}
              className="w-5 h-5 text-[#5c3a21] rounded-md border-stone-300 focus:ring-[#5c3a21] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Danger Zone: Wipe Data */}
      <div className="leather-card rounded-2xl p-6 bg-rose-50/50 border border-rose-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-serif-brand text-lg font-bold text-rose-900 flex items-center gap-2">
              <AlertTriangle size={20} className="text-rose-600" /> Complete Data Wipe & Reset
            </h3>
            <p className="text-xs text-rose-700 mt-0.5">Permanently erase all local transactions, payees, and offline sync caches.</p>
          </div>

          {!showWipeConfirm ? (
            <button
              onClick={() => setShowWipeConfirm(true)}
              className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md transition cursor-pointer"
            >
              {t.wipeData}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowWipeConfirm(false)}
                className="py-2 px-3 rounded-lg bg-white border border-stone-300 text-stone-700 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onWipeData}
                className="py-2 px-4 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-md cursor-pointer"
              >
                Confirm Erase All
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
