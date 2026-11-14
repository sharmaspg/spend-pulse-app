import React from 'react';
import { ShoppingBag, PartyPopper, PiggyBank, Landmark, Trash2, ArrowRight } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, getTodayDateString } from '../../utils/formatters';
import { BudgetCategory, ExpenseTransaction } from '../../types/budget';

interface RecentTransactionsProps {
  onOpenAddExpense: () => void;
  onViewAll?: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  onOpenAddExpense,
  onViewAll
}) => {
  const { transactions, deleteTransaction, profile } = useBudget();
  const { currency } = profile;
  const todayStr = getTodayDateString();

  const todayTransactions = transactions.filter(t => t.date === todayStr);

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

  const getCategoryBadge = (category: BudgetCategory) => {
    switch (category) {
      case 'fun':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      case 'needs':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'savings':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'obligations':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="mx-4 mt-3 mb-6 p-4 rounded-2xl glass-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
          Today's Activity
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">
          {todayTransactions.length} logged
        </span>
      </div>

      {todayTransactions.length === 0 ? (
        <div className="text-center py-6 px-4">
          <p className="text-xs text-slate-400 mb-2">No expenses logged yet today.</p>
          <button
            onClick={onOpenAddExpense}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 transition-colors"
          >
            + Log your first spend
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {todayTransactions.slice(0, 6).map((txn: ExpenseTransaction) => (
            <div
              key={txn.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 hover:bg-slate-800/90 transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center shrink-0">
                  {getCategoryIcon(txn.category)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-100 truncate">{txn.note || 'Expense'}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-medium border ${getCategoryBadge(txn.category)}`}>
                      {txn.category.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {txn.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-100 font-mono">
                  -{formatCurrency(txn.amount, currency)}
                </span>
                <button
                  onClick={() => deleteTransaction(txn.id)}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-rose-400 p-1 rounded transition-opacity"
                  title="Delete Transaction"
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
