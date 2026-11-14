import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, PartyPopper, Zap, AlertTriangle, Bell } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBudget } from '../../context/BudgetContext';
import { BudgetCategory, PaymentMethod } from '../../types/budget';
import { getTodayDateString, formatCurrency } from '../../utils/formatters';
import { triggerBudgetExceededNotification, requestNotificationPermission } from '../../utils/notifications';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction, profile, metrics } = useBudget();
  const { currency } = profile;

  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('needs');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [selectedTag, setSelectedTag] = useState('');
  const [refNumber, setRefNumber] = useState('');

  useEffect(() => {
    // Proactively request notification permission on modal open if supported and not decided
    if (isOpen && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission().catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const numericAmount = parseFloat(amountStr) || 0;

  // Preset chips depending on currency
  const presetAmounts = currency === '₹' ? [50, 100, 200, 500, 1000, 2000] : [5, 10, 20, 50, 100];

  const funTags = ['Cafe/Coffee', 'Dining Out', 'Shopping', 'Movies/OTT', 'Weekend Fun', 'Snacks'];
  const needsTags = ['Groceries', 'Cab/Transit', 'Fuel/Petrol', 'Medicine', 'Utilities', 'Maintenance'];

  // Over-budget live detection
  const isAlreadyOverBudget = metrics.isOverBudgetToday;
  const projectedRemaining = metrics.remainingToday - numericAmount;
  const willExceedBudget = numericAmount > 0 && projectedRemaining < 0;
  const projectedOverspend = willExceedBudget ? Math.abs(projectedRemaining) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) return;

    // Log the transaction
    addTransaction({
      amount: numericAmount,
      category,
      note: note.trim() || selectedTag || (category === 'needs' ? 'Needs & Essentials' : 'Fun & Discretionary'),
      paymentMethod,
      date: getTodayDateString(),
      tags: selectedTag ? [selectedTag] : [],
      referenceNumber: refNumber.trim() || (paymentMethod === 'UPI' ? `UPI/${Math.floor(100000000 + Math.random() * 900000000)}` : undefined)
    });

    // Check if over-budget alert should fire
    if (willExceedBudget || isAlreadyOverBudget) {
      triggerBudgetExceededNotification(numericAmount, projectedOverspend, currency);
    } else {
      // Confetti celebration when logging within daily allowance
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#06b6d4']
        });
      } catch {}
    }

    // Reset and close
    setAmountStr('');
    setNote('');
    setSelectedTag('');
    setRefNumber('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Log Expense</span>
              <span className="text-[10px] bg-indigo-500/15 text-indigo-400 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
                1-Tap Entry
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isAlreadyOverBudget ? (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Over budget today by {formatCurrency(metrics.overBudgetAmount, currency)}
                </span>
              ) : (
                <>Safe daily balance left: <strong className="text-emerald-400">{formatCurrency(metrics.remainingToday, currency)}</strong></>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Over-Budget Alert Banner inside modal */}
        {willExceedBudget && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2 animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">⚠️ Budget Warning!</strong>
              <span>
                {isAlreadyOverBudget
                  ? `You are already over budget. Logging ${formatCurrency(numericAmount, currency)} will increase your daily deficit to ${formatCurrency(projectedOverspend, currency)}!`
                  : `This expense will exceed today's remaining safe limit by ${formatCurrency(projectedOverspend, currency)}! A notification alert will be triggered.`}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Amount Spent ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-indigo-400 font-mono">
                {currency}
              </span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                required
                autoFocus
                placeholder="0"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 bg-slate-800/90 border rounded-2xl text-2xl font-bold text-white focus:outline-none font-mono ${
                  willExceedBudget ? 'border-rose-500/80 focus:ring-2 focus:ring-rose-500/30' : 'border-slate-700 focus:border-indigo-500'
                }`}
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmountStr(String(preset))}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 active:scale-95 transition-all"
                >
                  +{currency}{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Category Toggle (Both deduct from Daily Budget) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Category Bucket
              </label>
              <span className="text-[10px] text-indigo-300 font-medium">
                Both deduct from your daily budget
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategory('needs')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  category === 'needs'
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">🏠 Needs & Bills</div>
                  <div className="text-[10px] text-slate-400">Groceries, Fuel, Meds</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCategory('fun')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  category === 'fun'
                    ? 'bg-pink-500/20 border-pink-500/60 text-pink-300 shadow-md shadow-pink-500/10'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
                  <PartyPopper className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">🎉 Fun & Wants</div>
                  <div className="text-[10px] text-slate-400">Dining, Outings, Cafes</div>
                </div>
              </button>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Payment Method
              </label>
              <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-medium">
                <Zap className="w-3 h-3" /> UPI Sync Ready
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {(['UPI', 'Card', 'Cash', 'NetBanking'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all ${
                    paymentMethod === method
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700'
                  }`}
                >
                  {method === 'UPI' ? '⚡ UPI' : method}
                </button>
              ))}
            </div>
          </div>

          {/* Note / Merchant & Tags */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Note / Merchant
            </label>
            <input
              type="text"
              placeholder="e.g. Supermarket, Cab, Starbucks, Veggies"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />

            {/* Quick Tag Suggestion Chips */}
            <div className="flex flex-wrap gap-1 mt-2">
              {(category === 'needs' ? needsTags : funTags).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSelectedTag(tag);
                    if (!note) setNote(tag);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors ${
                    selectedTag === tag || note.includes(tag)
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={numericAmount <= 0}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
              numericAmount <= 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : willExceedBudget
                ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30 cursor-pointer active:scale-[0.99]'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30 cursor-pointer active:scale-[0.99]'
            }`}
          >
            {willExceedBudget ? (
              <>
                <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                <span>Log Anyway (Over Budget)</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Confirm & Deduct from Daily Budget</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
