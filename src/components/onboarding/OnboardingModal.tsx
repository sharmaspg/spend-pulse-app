import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Plus, Trash2, Landmark, CheckCircle2, ShieldCheck, Wallet } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBudget } from '../../context/BudgetContext';
import { FixedObligation, BudgetRatios } from '../../types/budget';
import { formatCurrency } from '../../utils/formatters';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { completeOnboarding, profile } = useBudget();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [currency, setCurrency] = useState(profile.currency || '₹');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(profile.monthlyIncome || 85000);

  // Step 2: Obligations
  const [obligations, setObligations] = useState<FixedObligation[]>(
    profile.obligations?.length > 0
      ? profile.obligations
      : [
          { id: '1', name: 'Home Loan / Rent', amount: 20000, category: 'Rent' },
          { id: '2', name: 'Car / Bike EMI', amount: 8000, category: 'EMI' },
          { id: '3', name: 'Insurance & Subscriptions', amount: 2000, category: 'Insurance' }
        ]
  );
  const [newObName, setNewObName] = useState('');
  const [newObAmount, setNewObAmount] = useState('');
  const [newObCat, setNewObCat] = useState<FixedObligation['category']>('EMI');

  // Step 3: Ratios
  const [ratios, setRatios] = useState<BudgetRatios>(profile.ratios || { needs: 40, fun: 30, savings: 30 });

  if (!isOpen) return null;

  const totalObligations = obligations.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const allocatablePool = Math.max(0, monthlyIncome - totalObligations);

  // Live daily spending projection (Needs + Fun combined)
  const monthlyVariableBudget = (allocatablePool * (ratios.needs + ratios.fun)) / 100;
  const projectedDailyTotal = Math.round(monthlyVariableBudget / 30);
  const projectedWeeklyTotal = projectedDailyTotal * 7;

  const totalPct = ratios.needs + ratios.fun + ratios.savings;
  const isRatioValid = totalPct === 100;

  const handleAddObligation = () => {
    const amt = parseFloat(newObAmount);
    if (!newObName.trim() || isNaN(amt) || amt <= 0) return;

    setObligations(prev => [
      ...prev,
      {
        id: 'ob-' + Date.now(),
        name: newObName.trim(),
        amount: amt,
        category: newObCat
      }
    ]);
    setNewObName('');
    setNewObAmount('');
  };

  const handleRemoveObligation = (id: string) => {
    setObligations(prev => prev.filter(o => o.id !== id));
  };

  const handleFinish = () => {
    if (!isRatioValid || monthlyIncome <= 0) return;

    completeOnboarding({
      monthlyIncome,
      obligations,
      ratios,
      currency
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Progress Dots */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'w-7 bg-indigo-500' : s < step ? 'w-3 bg-emerald-500' : 'w-3 bg-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Step {step} of 3</span>
        </div>

        {/* STEP 1: Income & Currency */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center pb-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center mb-2.5">
                <Wallet className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Monthly Take-Home Income</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                What is your total net salary or predictable monthly income?
              </p>
            </div>

            {/* Currency selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Preferred Currency
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['₹', '$', '€', '£'].map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`py-2 text-sm font-bold rounded-xl border transition-colors ${
                      currency === curr
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            {/* Income Input */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Net Monthly Income ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-indigo-400">
                  {currency}
                </span>
                <input
                  type="number"
                  min="0"
                  value={monthlyIncome || ''}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  placeholder="e.g. 85000"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-xl font-bold text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[40000, 60000, 85000, 120000, 150000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setMonthlyIncome(amt)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  {currency}{amt.toLocaleString()}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={monthlyIncome <= 0}
              className="w-full mt-4 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <span>Next: Fixed EMIs & Obligations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Fixed Obligations */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center pb-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-2">
                <Landmark className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Fixed Monthly Obligations</h2>
              <p className="text-xs text-slate-400">
                Loans, EMIs, House Rent, and Insurance deducted first before budgeting.
              </p>
            </div>

            {/* Current Total Banner */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Total Obligations</span>
                <span className="text-sm font-bold text-amber-400">
                  {formatCurrency(totalObligations, currency)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Remaining Disposable Pool</span>
                <span className="text-sm font-bold text-emerald-400">
                  {formatCurrency(allocatablePool, currency)}
                </span>
              </div>
            </div>

            {/* List of Obligations */}
            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
              {obligations.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200 block">{item.name}</span>
                    <span className="text-[10px] text-slate-400">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-300">
                      {formatCurrency(item.amount, currency)}
                    </span>
                    <button
                      onClick={() => handleRemoveObligation(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Obligation Form */}
            <div className="p-3 rounded-xl bg-slate-800/40 border border-dashed border-slate-700 space-y-2">
              <span className="text-[11px] font-semibold text-slate-300 block">+ Add Obligation / EMI</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="e.g. Car Loan EMI"
                  value={newObName}
                  onChange={(e) => setNewObName(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newObAmount}
                  onChange={(e) => setNewObAmount(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div className="flex items-center justify-between">
                <select
                  value={newObCat}
                  onChange={(e) => setNewObCat(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-300 px-2 py-1"
                >
                  <option value="EMI">Loan / EMI</option>
                  <option value="Rent">Rent</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Subscription">Fixed Bill</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddObligation}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-lg shadow-indigo-600/30"
              >
                <span>Next: Set Budget Ratios</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Budget Ratios & Launch */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center pb-1">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-pink-400 mx-auto flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Your Budget Ratio</h2>
              <p className="text-xs text-slate-400">
                Split your disposable pool ({formatCurrency(allocatablePool, currency)}) into 3 categories.
              </p>
            </div>

            {/* Quick Strategy Preset */}
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setRatios({ needs: 40, fun: 30, savings: 30 })}
                className="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-indigo-600/30 border border-indigo-500/50 text-indigo-200"
              >
                40 / 30 / 30
              </button>
              <button
                type="button"
                onClick={() => setRatios({ needs: 50, fun: 30, savings: 20 })}
                className="flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300"
              >
                50 / 30 / 20
              </button>
              <button
                type="button"
                onClick={() => setRatios({ needs: 30, fun: 20, savings: 50 })}
                className="flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300"
              >
                30 / 20 / 50
              </button>
            </div>

            {/* Sliders */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-cyan-400">🏠 Needs & Essentials</span>
                  <span className="font-mono text-white">{ratios.needs}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ratios.needs}
                  onChange={(e) => setRatios(prev => ({ ...prev, needs: Number(e.target.value) }))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-pink-400">🎉 Fun & Guilt-Free</span>
                  <span className="font-mono text-white">{ratios.fun}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ratios.fun}
                  onChange={(e) => setRatios(prev => ({ ...prev, fun: Number(e.target.value) }))}
                  className="w-full accent-pink-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-400">💰 Savings & Investments</span>
                  <span className="font-mono text-white">{ratios.savings}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ratios.savings}
                  onChange={(e) => setRatios(prev => ({ ...prev, savings: Number(e.target.value) }))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            {/* Total Balance indicator */}
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
              <span className="text-slate-400">Total Sum:</span>
              <span className={`font-bold font-mono ${isRatioValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalPct}% / 100% {isRatioValid ? '✓' : '(Must equal 100%)'}
              </span>
            </div>

            {/* Daily Allowance Live Calculation Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-950/80 to-purple-950/80 border border-indigo-500/40 text-center">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-300 block mb-0.5">
                Your Calculated Daily Spending Limit (Needs + Fun)
              </span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                {formatCurrency(projectedDailyTotal, currency)} <span className="text-xs text-slate-300 font-normal">/ day</span>
              </div>
              <span className="text-[11px] text-slate-300 mt-1 block">
                Weekly budget: <strong>{formatCurrency(projectedWeeklyTotal, currency)}</strong> · Monthly savings: <strong>{formatCurrency((allocatablePool * ratios.savings) / 100, currency)}</strong>
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                onClick={handleFinish}
                disabled={!isRatioValid}
                className={`w-2/3 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xl transition-all ${
                  isRatioValid
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/30 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Launch My Budget App</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
