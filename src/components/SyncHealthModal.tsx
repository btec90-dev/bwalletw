import React from 'react';
import { Transaction } from '../types';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface SyncHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  isSimulatedOffline: boolean;
  onToggleOffline: () => void;
  onSyncNow: () => void;
}

export const SyncHealthModal: React.FC<SyncHealthModalProps> = ({
  isOpen,
  onClose,
  transactions,
  isSimulatedOffline,
  onToggleOffline,
  onSyncNow,
}) => {
  if (!isOpen) return null;

  const pendingTxs = transactions.filter((t) => !t.synced);
  const isOnline = navigator.onLine && !isSimulatedOffline;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-md w-full leather-card rounded-2xl p-6 shadow-2xl bg-white border border-[#e6dec9] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-lg"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {isOnline ? <Cloud size={24} /> : <CloudOff size={24} />}
          </div>
          <div>
            <h3 className="font-serif-brand text-xl font-bold text-stone-800">Offline-First Sync Hub</h3>
            <p className="text-xs text-stone-500">IndexedDB local persistence & real-time queue reconciliation</p>
          </div>
        </div>

        {/* Status Indicator Card */}
        <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-stone-700">Network State</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`} />
              {isOnline ? 'Online & Connected' : 'Simulated Offline'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-stone-700">Pending Sync Queue</span>
            <span className="font-mono text-sm font-bold text-stone-900 bg-stone-200 px-2 py-0.5 rounded-md">
              {pendingTxs.length} items
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-stone-700">Last Sync Timestamp</span>
            <span className="text-xs text-stone-500 font-mono">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Network State Simulator Toggle */}
        <div className="flex items-center justify-between bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 mb-4">
          <div>
            <span className="text-xs font-bold text-amber-900 block">Edge Testing Simulator</span>
            <span className="text-[11px] text-amber-700">Toggle offline mode to test IndexedDB sync queue</span>
          </div>
          <button
            onClick={onToggleOffline}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              isSimulatedOffline
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-stone-700 border border-stone-300'
            }`}
          >
            {isSimulatedOffline ? 'Simulating Offline' : 'Go Simulated Offline'}
          </button>
        </div>

        {/* Pending Items List */}
        {pendingTxs.length > 0 && (
          <div className="mb-4 max-h-40 overflow-y-auto space-y-2">
            <span className="text-xs font-semibold uppercase text-stone-500 tracking-wider">Unsynced Queue</span>
            {pendingTxs.map((t) => (
              <div key={t.id} className="text-xs bg-amber-50/80 border border-amber-200 p-2.5 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-medium text-stone-800">{t.payeeName}</span>
                  <span className="text-stone-500 block">{t.category} • {t.date}</span>
                </div>
                <span className="font-mono font-bold text-amber-800">
                  {t.amount.toLocaleString()} {t.currency}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="flex gap-3">
          <button
            onClick={onSyncNow}
            disabled={!isOnline || pendingTxs.length === 0}
            className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition ${
              isOnline && pendingTxs.length > 0
                ? 'bg-[#5c3a21] text-white hover:bg-[#452b18] shadow-md cursor-pointer'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <RefreshCw size={16} className={pendingTxs.length > 0 && isOnline ? 'animate-spin' : ''} />
            <span>Synchronize Now ({pendingTxs.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
