import React, { useState } from 'react';
import { Payee, CurrencyCode, PaymentMethod, AppSettings } from '../types';
import { CATEGORIES, CURRENCIES, PAYMENT_METHODS, TRANSLATIONS } from '../constants';
import { Users, Search, Plus, Trash2, Edit3, Phone, ShieldCheck, Sparkles } from 'lucide-react';

interface PayeesViewProps {
  payees: Payee[];
  onSavePayee: (payee: Payee) => void;
  onDeletePayee: (id: string) => void;
  settings: AppSettings;
}

export const PayeesView: React.FC<PayeesViewProps> = ({
  payees,
  onSavePayee,
  onDeletePayee,
  settings,
}) => {
  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.en;

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [subcategory, setSubcategory] = useState(CATEGORIES[0].subcategories[0]);
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState<PaymentMethod>('Mobile Money (Orange)');
  const [paymentIdentifier, setPaymentIdentifier] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>('CFA');

  const filteredPayees = payees.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.paymentIdentifier && p.paymentIdentifier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCategoryChange = (catName: string) => {
    setCategory(catName);
    const found = CATEGORIES.find((c) => c.name === catName);
    if (found && found.subcategories.length > 0) {
      setSubcategory(found.subcategories[0]);
    } else {
      setSubcategory('');
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setCategory(CATEGORIES[0].name);
    setSubcategory(CATEGORIES[0].subcategories[0]);
    setPreferredPaymentMethod('Mobile Money (Orange)');
    setPaymentIdentifier('');
    setDefaultCurrency('CFA');
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: Payee) => {
    setEditingId(p.id);
    setName(p.name);
    setCategory(p.category);
    setSubcategory(p.subcategory);
    setPreferredPaymentMethod(p.preferredPaymentMethod);
    setPaymentIdentifier(p.paymentIdentifier || '');
    setDefaultCurrency(p.defaultCurrency);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const payee: Payee = {
      id: editingId || `payee-${Date.now()}`,
      name,
      category,
      subcategory,
      preferredPaymentMethod,
      paymentIdentifier: paymentIdentifier.trim() ? paymentIdentifier : undefined,
      defaultCurrency,
      frequencyCount: editingId ? payees.find((p) => p.id === editingId)?.frequencyCount || 1 : 1,
      updatedAt: Date.now(),
    };

    onSavePayee(payee);
    setShowAddModal(false);
  };

  const currentCategoryObj = CATEGORIES.find((c) => c.name === category);

  return (
    <div className="space-y-6 pb-24">
      
      {/* Top Header */}
      <div className="leather-card rounded-2xl p-6 bg-white border border-[#e6dec9] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-brand text-2xl font-bold text-[#5c3a21]">Smart Payees & Recipients Directory</h2>
          <p className="text-xs text-stone-500">Streamline repeated family remittances, vendor bills, and mobile money payouts</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="py-2.5 px-4 bg-[#5c3a21] hover:bg-[#452b18] text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <Plus size={16} />
          <span>{t.addPayee}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="leather-card rounded-2xl p-4 bg-white border border-[#e6dec9] flex items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPayees}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
          />
        </div>
      </div>

      {/* Payees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPayees.map((p) => (
          <div key={p.id} className="leather-card rounded-2xl p-5 bg-white border border-[#e6dec9] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-serif-brand font-bold text-stone-900 text-base">{p.name}</h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800 font-mono">
                  {p.defaultCurrency}
                </span>
              </div>

              <div className="text-xs text-stone-600 mb-3">
                <span className="font-semibold text-stone-800 block">{p.category} → {p.subcategory}</span>
                <span className="text-stone-500 mt-1 block flex items-center gap-1">
                  <ShieldCheck size={14} className="text-[#5c3a21]" /> Preferred: {p.preferredPaymentMethod}
                </span>
                {p.paymentIdentifier && (
                  <span className="text-stone-500 mt-0.5 block font-mono text-[11px] flex items-center gap-1">
                    <Phone size={12} /> {p.paymentIdentifier}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>Used {p.frequencyCount} times</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 transition cursor-pointer"
                  title="Edit Payee"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => onDeletePayee(p.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition cursor-pointer"
                  title="Delete Payee"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Payee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full leather-card rounded-3xl p-6 shadow-2xl bg-white border border-[#e6dec9] relative">
            <h3 className="font-serif-brand text-xl font-bold text-[#5c3a21] mb-4">
              {editingId ? 'Edit Payee Profile' : 'Add New Payee / Recipient'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Payee Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sylvanus (Tutor)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Subcategory</label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
                  >
                    {currentCategoryObj?.subcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Preferred Payment Method</label>
                <select
                  value={preferredPaymentMethod}
                  onChange={(e) => setPreferredPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Payment Identifier (Phone/IBAN)</label>
                  <input
                    type="text"
                    value={paymentIdentifier}
                    onChange={(e) => setPaymentIdentifier(e.target.value)}
                    placeholder="+225 07..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">Default Currency</label>
                  <select
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#5c3a21]"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#5c3a21] hover:bg-[#452b18] text-white text-xs font-semibold shadow-md transition cursor-pointer"
                >
                  Save Payee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
