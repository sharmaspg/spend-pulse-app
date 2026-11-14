import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  PieChart as PieIcon,
  CreditCard,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency, formatShortDate } from '../../utils/formatters';

export const BudgetAnalytics: React.FC = () => {
  const { metrics, profile, transactions } = useBudget();
  const { currency } = profile;

  // Days in month pacing
  const monthProgressPct = Math.round((metrics.daysPassedInMonth / metrics.daysInMonth) * 100);
  const funBudgetSpentPct = metrics.monthlyFunBudget > 0
    ? Math.round((metrics.spentFunMonth / metrics.monthlyFunBudget) * 100)
    : 0;

  // Pace status
  const isPacingWell = funBudgetSpentPct <= monthProgressPct;

  // Payment method breakdown
  const paymentBreakdown = transactions.reduce((acc, t) => {
    acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalSpentAcrossAll = Object.values(paymentBreakdown).reduce((a, b) => a + b, 0);

  // Group by day for last 7 days chart
  const last7Days: { dateStr: string; label: string; funAmount: number; totalAmount: number }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });

    const dayTxns = transactions.filter(t => t.date === dateStr);
    const funAmount = dayTxns.filter(t => t.category === 'fun').reduce((s, t) => s + t.amount, 0);
    const totalAmount = dayTxns.reduce((s, t) => s + t.amount, 0);

    last7Days.push({ dateStr, label: dayLabel, funAmount, totalAmount });
  }

  const maxDailySpend = Math.max(metrics.baseDailyFunBudget * 1.5, ...last7Days.map(d => d.totalAmount), 100);

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Top Banner: Pacing Velocity */}
      <div className={`p-4 rounded-2xl border ${
        isPacingWell
          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
          : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          {isPacingWell ? (
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          ) : (
            <TrendingDown className="w-5 h-5 text-amber-400" />
          )}
          <h3 className="text-sm font-bold">
            {isPacingWell ? 'Healthy Spending Velocity 🚀' : 'High Burn Rate Detected ⚠️'}
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {isPacingWell
            ? `Month is ${monthProgressPct}% complete, and you have consumed only ${funBudgetSpentPct}% of your fun budget. Keep going to supercharge your savings!`
            : `Month is ${monthProgressPct}% complete, but you've already used ${funBudgetSpentPct}% of your discretionary budget. Your daily limit has been adjusted down to protect your savings.`}
        </p>
      </div>

      {/* 7-Day Spending Bar Chart */}
      <div className="p-4 rounded-2xl glass-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Last 7 Days Activity
            </h4>
          </div>
          <span className="text-[10px] text-slate-400">
            Target: {formatCurrency(metrics.safeToSpendToday, currency)}/day
          </span>
        </div>

        {/* Visual Bars */}
        <div className="h-36 flex items-end justify-between gap-2 pt-4 px-1">
          {last7Days.map((day, idx) => {
            const heightPct = Math.min(100, Math.round((day.totalAmount / maxDailySpend) * 100));
            const isToday = idx === 6;

            return (
              <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                  {currency}{Math.round(day.totalAmount)}
                </span>
                <div className="w-full bg-slate-800/80 rounded-t-lg h-full max-h-24 flex items-end overflow-hidden border border-slate-700/40">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isToday
                        ? 'bg-gradient-to-t from-indigo-600 to-violet-400'
                        : day.totalAmount > metrics.baseDailyFunBudget
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                        : 'bg-gradient-to-t from-emerald-600 to-teal-400'
                    }`}
                    style={{ height: `${Math.max(8, heightPct)}%` }}
                  />
                </div>
                <span className={`text-[10px] font-bold ${isToday ? 'text-indigo-400' : 'text-slate-400'}`}>
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Method Distribution */}
      <div className="p-4 rounded-2xl glass-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Payment Rails
            </h4>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Zap className="w-3 h-3" /> Auto-Sync Capable
          </span>
        </div>

        <div className="space-y-2">
          {Object.entries(paymentBreakdown).map(([method, amount]) => {
            const pct = totalSpentAcrossAll > 0 ? Math.round((amount / totalSpentAcrossAll) * 100) : 0;
            return (
              <div key={method} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">
                    {method === 'UPI' ? '⚡ UPI Payments' : method}
                  </span>
                  <span className="text-slate-400 font-mono">
                    <strong className="text-slate-200">{formatCurrency(amount, currency)}</strong> ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      method === 'UPI' ? 'bg-emerald-400' : 'bg-indigo-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Future Automation & Bank/UPI Sync Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-950/70 via-slate-900 to-purple-950/70 border border-indigo-500/30 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white">Upcoming: UPI & Bank SMS Auto-Parser</h4>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          The transaction schema is pre-configured with UPI reference IDs and Merchant categories. Once compiled to native Android via Capacitor, the native notification listener hook will automatically parse GPay, PhonePe, and bank SMS debit alerts!
        </p>
      </div>
    </div>
  );
};
