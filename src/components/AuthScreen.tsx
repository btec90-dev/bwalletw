import React, { useState } from 'react';
import { UserAccount } from '../types';
import { Lock, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('410bala@gmail.com');
  const [name, setName] = useState('Bala Balatec');
  const [password, setPassword] = useState('••••••••');
  const [pin, setPin] = useState('1234');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user: UserAccount = {
      email,
      name: name || 'Balatec User',
      isLoggedIn: true,
      pinCode: pin.length === 4 ? pin : '1234',
      isLocked: false,
    };
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fcf9f5] theme-brown">
      <div className="max-w-md w-full leather-card rounded-2xl p-8 shadow-xl border border-[#e6dec9] relative overflow-hidden">
        {/* Decorative Leather Stitching Top Border */}
        <div className="absolute top-0 left-0 right-0 h-2 leather-stitch opacity-60"></div>

        <div className="text-center mb-8 mt-2">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#5c3a21] flex items-center justify-center text-white shadow-lg">
            <span className="font-serif-brand text-3xl font-bold tracking-wider">B</span>
          </div>
          <h1 className="font-serif-brand text-3xl font-bold text-[#5c3a21]">Balatec Wallet</h1>
          <p className="text-sm text-stone-600 mt-1">Offline-First Multi-Currency Financial Ledger & Sync Hub</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
                  placeholder="Bala Balatec"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
                placeholder="you@domain.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">4-Digit Security PIN (Quick Unlock)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                <ShieldCheck size={18} />
              </span>
              <input
                type="text"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5c3a21] tracking-widest font-mono"
                placeholder="1234"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 py-3 px-4 bg-[#5c3a21] hover:bg-[#452b18] text-white font-medium rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isRegistering ? 'Create Secure Account' : 'Sign In to Wallet'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-[#5c3a21] hover:underline font-medium cursor-pointer"
          >
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};
