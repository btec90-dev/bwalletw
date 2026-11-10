import React, { useState } from 'react';
import { Shield, Delete, Unlock } from 'lucide-react';

interface PinLockScreenProps {
  correctPin: string;
  onUnlock: () => void;
  userName: string;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ correctPin, onUnlock, userName }) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState(false);

  const handleNumClick = (num: string) => {
    if (enteredPin.length < 4) {
      const next = enteredPin + num;
      setEnteredPin(next);
      setError(false);
      if (next.length === 4) {
        if (next === (correctPin || '1234')) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => {
            setEnteredPin('');
            setError(false);
          }, 800);
        }
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fcf9f5]">
      <div className="max-w-sm w-full leather-card rounded-3xl p-8 shadow-2xl border border-[#e6dec9] text-center relative">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#5c3a21] flex items-center justify-center text-white shadow-lg">
          <Shield size={32} />
        </div>
        <h2 className="font-serif-brand text-2xl font-bold text-[#5c3a21]">Locked Wallet</h2>
        <p className="text-xs text-stone-600 mt-1">Welcome back, {userName}</p>

        {/* PIN dots */}
        <div className="flex justify-center gap-3 my-6">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = idx < enteredPin.length;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  error
                    ? 'bg-red-500 animate-bounce'
                    : isFilled
                    ? 'bg-[#5c3a21] scale-110'
                    : 'border-2 border-stone-300 bg-white'
                }`}
              />
            );
          })}
        </div>

        {error && <p className="text-xs text-red-600 font-medium mb-4">Incorrect 4-digit PIN. Try 1234.</p>}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((item, index) => {
            if (item === '') return <div key={index} />;
            if (item === 'del') {
              return (
                <button
                  key={index}
                  onClick={handleDelete}
                  className="h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition cursor-pointer active:scale-95"
                >
                  <Delete size={20} />
                </button>
              );
            }
            return (
              <button
                key={index}
                onClick={() => handleNumClick(item)}
                className="h-14 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-[#5c3a21] text-xl font-bold shadow-sm transition cursor-pointer active:scale-95"
              >
                {item}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-stone-400 mt-2 flex items-center justify-center gap-1">
          <Unlock size={14} />
          <span>Enter PIN to unlock sensitive ledger data</span>
        </div>
      </div>
    </div>
  );
};
