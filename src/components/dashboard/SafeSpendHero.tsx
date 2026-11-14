import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, ShoppingBag, PartyPopper, Bell, BellOff } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../utils/formatters';
import { requestNotificationPermission } from '../../utils/notifications';

interface SafeSpendHeroProps {
  onOpenAddExpense: () => void;
}

export const SafeSpendHero: React.FC<SafeSpendHeroProps> = ({ onOpenAddExpense }) => {
  const { metrics, profile } = useBudget();
  const { currency } = profile;

  const [hasNotifPermission, setHasNotifPermission] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  const safeToday = metrics.safeToSpendToday;
  const spentToday = metrics.spentToday; // Combines BOTH Needs and Fun
  const remainingToday = metrics.remainingToday;

  // Percentage of daily allowance used
  const percentUsed = safeToday > 0 ? Math.min(100, Math.max(0, (spentToday / safeToday) * 100)) : 100;
  const isOverspent = metrics.isOverBudgetToday;

  // Visual color determination
  let badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  let statusText = 'On Track - Safe to spend';
  let statusIcon = <CheckCircle2 className="w-3.5 h-3.5" />;

  if (isOverspent) {
    badgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse';
    statusText = `Overspent by ${formatCurrency(metrics.overBudgetAmount, currency)}`;
    statusIcon = <AlertTriangle className="w-3.5 h-3.5" />;
  } else if (percentUsed > 75) {
    badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    statusText = 'Approaching Daily Limit';
    statusIcon = <AlertTriangle className="w-3.5 h-3.5" />;
  }

  // Circular gauge calculation
  const strokeWidth = 10;
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentUsed) / 100;

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setHasNotifPermission(granted);
  };

  return (
    <div className="mx-4 mt-3 p-5 rounded-3xl glass-card-elevated relative overflow-hidden">
      {/* Background ambient glow */}
      <div className={`absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none ${
        isOverspent ? 'bg-rose-500/25' : 'bg-indigo-500/15'
      }`}></div>
      <div className={`absolute -bottom-10 -left-10 w-44 h-44 rounded-full blur-3xl pointer-events-none ${
        isOverspent ? 'bg-red-500/25' : 'bg-violet-500/15'
      }`}></div>

      {/* Header Row */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Today's Safe Allowance
          </span>
          <span className="text-[10px] bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-medium">
            Needs + Fun
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Notification Alert Status Pill */}
          {!hasNotifPermission && (
            <button
              onClick={handleEnableNotifications}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 flex items-center gap-1 transition-colors"
              title="Enable browser/system alerts when over budget"
            >
              <Bell className="w-3 h-3 text-amber-400" />
              <span>Enable Alerts</span>
            </button>
          )}

          <div className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeColor}`}>
            {statusIcon}
            <span>{statusText}</span>
          </div>
        </div>
      </div>

      {/* Main Dial & Numbers */}
      <div className="flex items-center justify-between gap-4 my-2 relative z-10">
        {/* Left Column: Big Amount */}
        <div className="flex-1">
          <div className="text-xs text-slate-400 font-medium mb-0.5">
            {isOverspent ? 'Over Daily Limit' : 'Remaining for Today'}
          </div>
          <div className={`text-3xl font-extrabold tracking-tight ${isOverspent ? 'text-rose-400' : 'text-white'}`}>
            {formatCurrency(remainingToday, currency)}
          </div>

          {/* Daily Limit & Spent Today Summary */}
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 block text-[10px]">Daily Limit</span>
              <span className="font-semibold text-slate-200">{formatCurrency(safeToday, currency)}</span>
            </div>
            <div className="w-px h-6 bg-slate-700/80"></div>
            <div>
              <span className="text-slate-400 block text-[10px]">Spent Today</span>
              <span className={`font-semibold ${isOverspent ? 'text-rose-400' : 'text-amber-400'}`}>
                {formatCurrency(spentToday, currency)}
              </span>
            </div>
          </div>

          {/* Sub-breakdown of today's expenses: Needs vs Fun */}
          <div className="mt-2.5 flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1 bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/20">
              <ShoppingBag className="w-3 h-3" /> Needs: {formatCurrency(metrics.spentTodayNeeds, currency)}
            </span>
            <span className="flex items-center gap-1 bg-pink-500/10 text-pink-300 px-1.5 py-0.5 rounded border border-pink-500/20">
              <PartyPopper className="w-3 h-3" /> Fun: {formatCurrency(metrics.spentTodayFun, currency)}
            </span>
          </div>
        </div>

        {/* Right Column: Radial Progress Meter */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background Circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-800"
              fill="transparent"
            />
            {/* Active Progress Circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="url(#heroGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor={isOverspent ? '#f43f5e' : percentUsed > 75 ? '#f59e0b' : '#10b981'} />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`text-xs font-bold tracking-tight ${isOverspent ? 'text-rose-400' : 'text-white'}`}>
              {Math.round(percentUsed)}%
            </span>
            <span className="text-[9px] text-slate-400 font-medium">used</span>
          </div>
        </div>
      </div>

      {/* Dynamic Pacer Advice Pill */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300 relative z-10">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>
            {remainingToday > 0
              ? `Safe to spend ${formatCurrency(remainingToday, currency)} more today across Needs & Fun.`
              : `⚠️ Over budget by ${formatCurrency(metrics.overBudgetAmount, currency)}. Tomorrow's allowance will adapt automatically.`}
          </span>
        </div>
        <button
          onClick={onOpenAddExpense}
          className="text-indigo-400 hover:text-indigo-300 font-semibold text-[11px] underline underline-offset-2 shrink-0 ml-2"
        >
          + Log
        </button>
      </div>
    </div>
  );
};
