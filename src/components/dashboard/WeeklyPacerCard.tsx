import React from 'react';
import { CalendarDays, AlertTriangle } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../utils/formatters';

export const WeeklyPacerCard: React.FC = () => {
  const { metrics, profile } = useBudget();
  const { currency } = profile;

  const weeklyBudget = metrics.currentWeekBudget;
  const spentThisWeek = metrics.spentThisWeek;
  const remainingThisWeek = metrics.remainingThisWeek;
  const isOverWeekly = spentThisWeek > weeklyBudget;

  const weekPercentUsed = weeklyBudget > 0 ? Math.min(100, (spentThisWeek / weeklyBudget) * 100) : 0;

  return (
    <div className="mx-4 mt-3 p-4 rounded-2xl glass-card relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-200">Weekly Pacer</h3>
            <p className="text-[10px] text-slate-400">Needs + Fun (7-Day Rolling)</p>
          </div>
        </div>

        <div className="text-right">
          <span className={`text-xs font-bold ${isOverWeekly ? 'text-rose-400' : 'text-slate-100'}`}>
            {formatCurrency(remainingThisWeek, currency)}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {isOverWeekly ? 'over weekly pace' : 'left this week'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 my-2 overflow-hidden border border-slate-700/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOverWeekly
              ? 'bg-rose-500'
              : weekPercentUsed > 90
              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
              : 'bg-gradient-to-r from-indigo-500 to-violet-500'
          }`}
          style={{ width: `${weekPercentUsed}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
        <span>Spent: {formatCurrency(spentThisWeek, currency)}</span>
        <span>Limit: {formatCurrency(weeklyBudget, currency)}</span>
      </div>
    </div>
  );
};
