import React, { useState } from 'react';
import { Sliders, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../utils/formatters';
import { BudgetRatios } from '../../types/budget';

interface RatioTunerProps {
  onSaved?: () => void;
}

export const RatioTuner: React.FC<RatioTunerProps> = ({ onSaved }) => {
  const { profile, updateRatios, metrics } = useBudget();
  const { currency } = profile;

  const [ratios, setRatios] = useState<BudgetRatios>(profile.ratios);
  const [justSaved, setJustSaved] = useState(false);

  const totalPct = ratios.needs + ratios.fun + ratios.savings;
  const isValid = totalPct === 100;

  // Real-time projected calculations
  const previewAllocatable = metrics.allocatablePool;
  const previewMonthlyVariable = (previewAllocatable * (ratios.needs + ratios.fun)) / 100;
  const previewDailyTotal = metrics.daysInMonth > 0 ? previewMonthlyVariable / metrics.daysInMonth : 0;
  const previewWeeklyTotal = previewDailyTotal * 7;
  const previewSavings = (previewAllocatable * ratios.savings) / 100;

  const handleRatioChange = (key: keyof BudgetRatios, val: number) => {
    setRatios(prev => ({
      ...prev,
      [key]: Math.max(0, Math.min(100, Math.round(val)))
    }));
  };

  const applyPreset = (needs: number, fun: number, savings: number) => {
    setRatios({ needs, fun, savings });
  };

  const handleSave = () => {
    if (!isValid) return;
    updateRatios(ratios);
    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
      if (onSaved) onSaved();
    }, 1000);
  };

  return (
    <div className="p-4 rounded-2xl glass-card space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Budget Ratio Tuner</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Allocate your remaining disposable pool: <strong className="text-slate-200">{formatCurrency(previewAllocatable, currency)}</strong>
          </p>
        </div>

        {/* Total Validation Badge */}
        <div
          className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
            isValid
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
          }`}
        >
          {isValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          <span>{totalPct}% / 100%</span>
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div>
        <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1.5">Popular Strategies</span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset(40, 30, 30)}
            className={`p-2 rounded-xl text-left border text-xs transition-colors ${
              ratios.needs === 40 && ratios.fun === 30 && ratios.savings === 30
                ? 'bg-indigo-600/30 border-indigo-500/60 text-white'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="font-bold">40 / 30 / 30</div>
            <div className="text-[10px] text-slate-400">Needs / Fun / Savings</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset(50, 30, 20)}
            className={`p-2 rounded-xl text-left border text-xs transition-colors ${
              ratios.needs === 50 && ratios.fun === 30 && ratios.savings === 20
                ? 'bg-indigo-600/30 border-indigo-500/60 text-white'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="font-bold">50 / 30 / 20</div>
            <div className="text-[10px] text-slate-400">Classic Rule</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset(30, 20, 50)}
            className={`p-2 rounded-xl text-left border text-xs transition-colors ${
              ratios.needs === 30 && ratios.fun === 20 && ratios.savings === 50
                ? 'bg-indigo-600/30 border-indigo-500/60 text-white'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="font-bold">30 / 20 / 50</div>
            <div className="text-[10px] text-slate-400">Aggressive Saver</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset(34, 33, 33)}
            className={`p-2 rounded-xl text-left border text-xs transition-colors ${
              ratios.needs === 34 && ratios.fun === 33 && ratios.savings === 33
                ? 'bg-indigo-600/30 border-indigo-500/60 text-white'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="font-bold">Equal Split</div>
            <div className="text-[10px] text-slate-400">34 / 33 / 33</div>
          </button>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-3 pt-2">
        {/* 1. Needs Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-cyan-400">🏠 Needs & Essentials</span>
            <span className="font-bold font-mono text-white">{ratios.needs}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={ratios.needs}
            onChange={(e) => handleRatioChange('needs', Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
          <div className="text-[10px] text-slate-400">
            Monthly: {formatCurrency((previewAllocatable * ratios.needs) / 100, currency)}
          </div>
        </div>

        {/* 2. Fun Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-pink-400">🎉 Fun & Discretionary (Safe Daily Pacer)</span>
            <span className="font-bold font-mono text-white">{ratios.fun}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={ratios.fun}
            onChange={(e) => handleRatioChange('fun', Number(e.target.value))}
            className="w-full accent-pink-500"
          />
          <div className="text-[10px] text-slate-400">
            Monthly: {formatCurrency((previewAllocatable * ratios.fun) / 100, currency)}
          </div>
        </div>

        {/* 3. Savings Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-emerald-400">💰 Savings & Investments</span>
            <span className="font-bold font-mono text-white">{ratios.savings}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={ratios.savings}
            onChange={(e) => handleRatioChange('savings', Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="text-[10px] text-slate-400">
            Monthly Target: {formatCurrency(previewSavings, currency)}
          </div>
        </div>
      </div>

      {/* Live Calculated Pacing Preview Box */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Projected Daily & Weekly Spending Allowance (Needs + Fun)</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Daily Total Limit</span>
            <span className="text-base font-extrabold text-emerald-400">
              {formatCurrency(previewDailyTotal, currency)}
            </span>
            <span className="text-[9px] text-slate-400 block">per day (Needs & Fun)</span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Weekly Total Allowance</span>
            <span className="text-base font-extrabold text-indigo-300">
              {formatCurrency(previewWeeklyTotal, currency)}
            </span>
            <span className="text-[9px] text-slate-400 block">per week</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!isValid}
        className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
          justSaved
            ? 'bg-emerald-600 text-white'
            : isValid
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
        }`}
      >
        {justSaved ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>Ratios Updated!</span>
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            <span>Apply New Budget Ratios</span>
          </>
        )}
      </button>
    </div>
  );
};
