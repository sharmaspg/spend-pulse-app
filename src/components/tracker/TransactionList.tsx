import React, { useState } from 'react';
import { ShoppingBag, PartyPopper, PiggyBank, Landmark, Trash2, Search, Filter } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, formatShortDate } from '../../utils/formatters';
import { BudgetCategory, ExpenseTransaction } from '../../types/budget';

interface TransactionListProps {
  onOpenAddExpense: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ onOpenAddExpense }) => {
  const { transactions, deleteTransaction, profile } = useBudget();
  const { currency } = profile;

  const [filterCat, setFilterCat] = useState<'all' | BudgetCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter(t => {
    const matchesCat = filterCat === 'all' || t.category === filterCat;
    const matchesQuery = !searchQuery.trim() ||
      t.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCat && matchesQuery;
  });

  const totalFilteredAmount = filtered.reduce((sum, t) => sum + t.amount, 0);

  const getCategoryIcon = (category: BudgetCategory) => {
    switch (category) {
      case 'fun':
        return <PartyPopper className="w-4 h-4 text-pink-400" />;
      case 'needs':
        return <ShoppingBag className="w-4 h-4 text-cyan-400" />;
      case 'savings':
        return <PiggyBank className="w-4 h-4 text-emerald-400" />;
      case 'obligations':
        return <Landmark className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="p-4 space-y-3 pb-24">
      {/* Search & Filter Header */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes, merchants, #tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {(['all', 'fun', 'needs', 'obligations'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-colors ${
                filterCat === cat
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Expenses' : cat === 'fun' ? '🎉 Fun' : cat === 'needs' ? '🏠 Needs' : '💳 EMIs'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary of filtered */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <span>{filtered.length} transactions found</span>
        <span>
          Total: <strong className="text-slate-200">{formatCurrency(totalFilteredAmount, currency)}</strong>
        </span>
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl p-6">
          <p className="text-xs text-slate-400 mb-3">No transactions found for this filter.</p>
          <button
            onClick={onOpenAddExpense}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
          >
            + Log An Expense
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((txn: ExpenseTransaction) => (
            <div
              key={txn.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/70 border border-slate-700/50 hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-700/60 flex items-center justify-center shrink-0">
                  {getCategoryIcon(txn.category)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-100 truncate">{txn.note || 'Expense'}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                    <span>{formatShortDate(txn.date)}</span>
                    <span>•</span>
                    <span className="font-mono">{txn.paymentMethod}</span>
                    {txn.referenceNumber && (
                      <span className="text-slate-500 truncate max-w-[80px]">({txn.referenceNumber})</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-sm font-bold font-mono text-slate-100">
                  -{formatCurrency(txn.amount, currency)}
                </span>
                <button
                  onClick={() => deleteTransaction(txn.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-opacity"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
