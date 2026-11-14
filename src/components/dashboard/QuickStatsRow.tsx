import React from 'react';
import { Wallet, Hourglass, CreditCard, ArrowDownRight } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../utils/formatters';

export const QuickStatsRow: React.FC = () => {
  const { metrics, profile } = useBudget();
  const { currency } = profile;

  return (
    <div className="grid grid-cols-2 gap-2.5 mx-4 mt-3">
      {/* Disposable Pool */}
      <div className="p-3 rounded-2xl glass-card flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
          <Wallet className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-slate-400 font-medium block truncate">Allocatable Pool</span>
          <span className="text-sm font-bold text-slate-100 truncate block">
            {formatCurrency(metrics.allocatablePool, currency)}
          </span>
        </div>
      </div>

      {/* Days Left in Month */}
      <div className="p-3 rounded-2xl glass-card flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
          <Hourglass className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-slate-400 font-medium block truncate">Days Remaining</span>
          <span className="text-sm font-bold text-slate-100 truncate block">
            {metrics.daysRemainingInMonth} <span className="text-xs font-normal text-slate-400">of {metrics.daysInMonth}d</span>
          </span>
        </div>
      </div>
    </div>
  );
};
