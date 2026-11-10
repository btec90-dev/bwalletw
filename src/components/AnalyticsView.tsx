import React, { useState } from 'react';
import { Transaction, AppSettings } from '../types';
import { CURRENCIES, CATEGORIES, TRANSLATIONS } from '../constants';
import { jsPDF } from 'jspdf';
import { FileText, Download, Share2, PieChart, TrendingUp, Search, ArrowUpRight, ArrowDownLeft, CheckCircle2, Clock, Calendar } from 'lucide-react';

interface AnalyticsViewProps {
  transactions: Transaction[];
  settings: AppSettings;
  onDeleteTransaction?: (id: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ transactions, settings, onDeleteTransaction }) => {
  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.en;
  const currencySymbol = CURRENCIES.find((c) => c.code === settings.currency)?.symbol || 'FCFA';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'monthly' | 'yearly'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString()); // YYYY

  // Date filtering logic
  const dateFilteredTransactions = transactions.filter((tx) => {
    if (dateRange === 'monthly') {
      return tx.date.startsWith(selectedMonth);
    }
    if (dateRange === 'yearly') {
      return tx.date.startsWith(selectedYear);
    }
    return true;
  });

  const expenses = dateFilteredTransactions.filter((tx) => tx.type === 'expense');
  const totalExpense = expenses.reduce((sum, tx) => sum + tx.amount, 0);

  // Category breakdown calculation on filtered transactions
  const categoryTotals = CATEGORIES.map((cat) => {
    const catTotal = expenses
      .filter((tx) => tx.category === cat.name)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const percentage = totalExpense > 0 ? (catTotal / totalExpense) * 100 : 0;
    return { name: cat.name, total: catTotal, percentage };
  }).sort((a, b) => b.total - a.total);

  const filteredTransactions = dateFilteredTransactions.filter((tx) => {
    const matchesSearch =
      tx.payeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.memo && tx.memo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || tx.type === filterType;

    return matchesSearch && matchesType;
  });

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['ID', 'Date', 'Type', 'Category', 'Subcategory', 'Payee', 'Amount', 'Currency', 'Payment Method', 'Memo'];
    const rows = dateFilteredTransactions.map((tx) => [
      tx.id,
      tx.date,
      tx.type,
      `"${tx.category}"`,
      `"${tx.subcategory}"`,
      `"${tx.payeeName}"`,
      tx.amount,
      tx.currency,
      `"${tx.paymentMethod}"`,
      `"${tx.memo || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `balatec_wallet_report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Generation using jsPDF
  const handleGeneratePdf = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(`Balatec Wallet - Report (${dateRange.toUpperCase()})`, 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Period Filter: ${dateRange === 'monthly' ? selectedMonth : dateRange === 'yearly' ? selectedYear : 'All Time'}`, 14, 34);

    let y = 45;
    doc.setFont('helvetica', 'bold');
    doc.text('Filtered Transactions Ledger:', 14, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFillColor(92, 58, 33);
    doc.setTextColor(255, 255, 255);
    doc.rect(14, y, 182, 8, 'F');
    doc.text('Date', 16, y + 5);
    doc.text('Payee', 45, y + 5);
    doc.text('Category', 105, y + 5);
    doc.text('Amount', 160, y + 5);
    y += 10;

    doc.setTextColor(0, 0, 0);
    dateFilteredTransactions.forEach((tx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(tx.date, 16, y);
      doc.text(tx.payeeName.substring(0, 25), 45, y);
      doc.text(tx.subcategory.substring(0, 25), 105, y);
      doc.text(`${tx.amount.toLocaleString()} ${tx.currency}`, 160, y);
      y += 8;
    });

    doc.save(`balatec_wallet_report_${dateRange}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Web Share API
  const handleShareReport = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Balatec Wallet Report (${dateRange})`,
          text: `Balatec Wallet Financial Summary for period [${dateRange}] - Total Expenses: ${totalExpense.toLocaleString()} ${currencySymbol}.`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share canceled or error:', err);
      }
    } else {
      alert('Web Share API is not supported on this browser. Use PDF or CSV export.');
    }
  };

  return (
    <div className="space-y-6 pb-24">
      
      {/* Top Header & Actions */}
      <div className="leather-card rounded-2xl p-6 bg-white border border-[#e6dec9] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-brand text-2xl font-bold text-[#5c3a21]">Analytics & Date Range Reports</h2>
          <p className="text-xs text-stone-500">Filter analytics and transactions by monthly, yearly, or all-time periods</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <Download size={16} />
            <span>{t.exportCsv}</span>
          </button>
          <button
            onClick={handleGeneratePdf}
            className="px-4 py-2.5 rounded-xl bg-[#5c3a21] hover:bg-[#452b18] text-white text-xs font-semibold flex items-center gap-2 shadow-md transition cursor-pointer"
          >
            <FileText size={16} />
            <span>{t.exportPdf}</span>
          </button>
          <button
            onClick={handleShareReport}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition cursor-pointer"
          >
            <Share2 size={16} />
            <span>{t.shareReport}</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="leather-card rounded-2xl p-4 bg-white border border-[#e6dec9] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[#5c3a21]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">Period Range Filter:</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setDateRange('all')}
              className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${dateRange === 'all' ? 'bg-[#5c3a21] text-white shadow-xs' : 'text-stone-700'}`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateRange('monthly')}
              className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${dateRange === 'monthly' ? 'bg-[#5c3a21] text-white shadow-xs' : 'text-stone-700'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setDateRange('yearly')}
              className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${dateRange === 'yearly' ? 'bg-[#5c3a21] text-white shadow-xs' : 'text-stone-700'}`}
            >
              Yearly
            </button>
          </div>

          {dateRange === 'monthly' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#5c3a21]"
            />
          )}

          {dateRange === 'yearly' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#5c3a21]"
            >
              {['2026', '2025', '2024', '2023'].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Category Spending Breakdown & FX */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Breakdown List */}
        <div className="leather-card rounded-2xl p-6 bg-white border border-[#e6dec9]">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={20} className="text-[#5c3a21]" />
            <h3 className="font-serif-brand text-lg font-bold text-stone-800">Category Spending ({dateRange})</h3>
          </div>

          <div className="space-y-4">
            {categoryTotals.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-stone-700">{cat.name}</span>
                  <span className="font-mono font-bold text-stone-900">
                    {cat.total.toLocaleString()} {currencySymbol} ({cat.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#5c3a21] h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Currency Conversion Summary */}
        <div className="leather-card rounded-2xl p-6 bg-white border border-[#e6dec9]">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-[#5c3a21]" />
            <h3 className="font-serif-brand text-lg font-bold text-stone-800">Currencies & FX Rates</h3>
          </div>

          <p className="text-xs text-stone-500 mb-4">
            Currencies strictly scoped to West African CFA (XOF), US Dollar ($), Canadian Dollar (CAD), and Euro (€).
          </p>

          <div className="space-y-3">
            {CURRENCIES.map((c) => (
              <div key={c.code} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#5c3a21]/10 text-[#5c3a21] font-bold text-xs flex items-center justify-center">
                    {c.symbol}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-stone-800 block">{c.name}</span>
                    <span className="text-[10px] text-stone-500 font-mono">Code: {c.code}</span>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-stone-700">
                  {c.rateToXof} XOF
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Filtered Transactions Master Ledger Section */}
      <div className="leather-card rounded-2xl bg-white border border-[#e6dec9] shadow-md overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50">
          <div>
            <h3 className="font-serif-brand font-bold text-stone-800 text-lg">Transactions ({filteredTransactions.length} of {dateFilteredTransactions.length})</h3>
            <p className="text-xs text-stone-500">Filtered ledger for selected period</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search filtered ledger..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#5c3a21]"
              />
            </div>

            <div className="flex bg-stone-200 p-0.5 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${filterType === 'all' ? 'bg-[#5c3a21] text-white shadow-xs' : 'text-stone-700'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${filterType === 'expense' ? 'bg-[#5c3a21] text-white shadow-xs' : 'text-stone-700'}`}
              >
                Expense
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${filterType === 'income' ? 'bg-[#5c3a21] text-white shadow-xs' : 'text-stone-700'}`}
              >
                Income
              </button>
              <button
                onClick={() => setFilterType('transfer')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${filterType === 'transfer' ? 'bg-[#5c3a21] text-white shadow-xs' : 'text-stone-700'}`}
              >
                Transfer
              </button>
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-sm">
            No transactions found matching your date range and search criteria.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredTransactions.map((tx) => {
              const isExpense = tx.type === 'expense';
              const isIncome = tx.type === 'income';

              return (
                <div key={tx.id} className="p-4 flex items-center justify-between gap-4 hover:bg-stone-50 transition">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
                        isExpense ? 'bg-rose-100 text-rose-700' : isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {isExpense ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-800 text-sm">{tx.payeeName}</span>
                        {!tx.synced ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Clock size={10} /> Pending
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

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span
                        className={`font-mono text-base font-bold block ${
                          isExpense ? 'text-rose-700' : isIncome ? 'text-emerald-700' : 'text-blue-700'
                        }`}
                      >
                        {isExpense ? '-' : isIncome ? '+' : ''}{tx.amount.toLocaleString()} {tx.currency}
                      </span>
                    </div>

                    {onDeleteTransaction && (
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete transaction"
                      >
                        🗑️
                      </button>
                    )}
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
