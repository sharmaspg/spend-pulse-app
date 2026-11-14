import React from 'react';
import { ShoppingBag, PartyPopper, PiggyBank, Landmark } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export const CategoryBudgetProgress: React.FC = () => {
  const { metrics, profile } = useBudget();
  const { currency } = profile;

  // Needs calculations
  const needsLimit = metrics.monthlyNeedsBudget;
  const needsSpent = metrics.spentNeedsMonth;
  const needsPct = needsLimit > 0 ? Math.min(100, (needsSpent / needsLimit) * 100) : 0;

  // Fun calculations
  const funLimit = metrics.monthlyFunBudget;
  const funSpent = metrics.spentFunMonth;
  const funPct = funLimit > 0 ? Math.min(100, (funSpent / funLimit) * 100) : 0;

  // Savings calculations (Target vs protected)
  const savingsTarget = metrics.monthlySavingsBudget;

  // Obligations
  const obligationsTotal = metrics.totalObligations;

  return (
    <div className="mx-4 mt-3 p-4 rounded-2xl glass-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
          Monthly Budget Breakdown
        </h3>
        <span className="text-[10px] text-indigo-400 font-medium">
          {profile.ratios.needs}% Needs · {profile.ratios.fun}% Fun · {profile.ratios.savings}% Savings
        </span>
      </div>

      <div className="space-y-3">
        {/* 1. Needs & Necessities */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
              <span>Needs & Necessities ({profile.ratios.needs}%)</span>
            </span>
            <span className="text-slate-400">
              <strong className="text-slate-200">{formatCurrency(needsSpent, currency)}</strong> / {formatCurrency(needsLimit, currency)}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${needsPct}%` }}
            ></div>
          </div>
        </div>

        {/* 2. Fun & Discretionary */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <PartyPopper className="w-3.5 h-3.5 text-pink-400" />
              <span>Fun & Guilt-Free ({profile.ratios.fun}%)</span>
            </span>
            <span className="text-slate-400">
              <strong className="text-slate-200">{formatCurrency(funSpent, currency)}</strong> / {formatCurrency(funLimit, currency)}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${funPct}%` }}
            ></div>
          </div>
        </div>

        {/* 3. Savings Target */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target Savings ({profile.ratios.savings}%)</span>
            </span>
            <span className="text-emerald-400 font-semibold">
              {formatCurrency(savingsTarget, currency)} protected
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              style={{ width: `100%` }}
            ></div>
          </div>
        </div>

        {/* 4. Fixed Obligations */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Landmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Fixed Obligations (EMIs & Rent)</span>
            </span>
            <span className="text-amber-400 font-semibold">
              {formatCurrency(obligationsTotal, currency)}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
              style={{ width: `100%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
