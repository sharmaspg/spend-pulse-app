import React, { useState } from 'react';
import {
  Wallet,
  Landmark,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Smartphone,
  Check,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { formatCurrency } from '../../utils/formatters';
import { FixedObligation } from '../../types/budget';

interface SettingsModalProps {
  onRerunOnboarding: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onRerunOnboarding }) => {
  const {
    profile,
    updateProfile,
    addObligation,
    removeObligation,
    resetAllData,
    loadSampleData,
    exportBackup,
    importBackup
  } = useBudget();

  const { currency, monthlyIncome, obligations } = profile;

  const [editIncome, setEditIncome] = useState<number>(monthlyIncome);
  const [newObName, setNewObName] = useState('');
  const [newObAmount, setNewObAmount] = useState('');
  const [newObCat, setNewObCat] = useState<FixedObligation['category']>('EMI');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleUpdateIncome = () => {
    if (editIncome > 0) {
      updateProfile({ monthlyIncome: editIncome });
    }
  };

  const handleAddObligation = () => {
    const amt = parseFloat(newObAmount);
    if (!newObName.trim() || isNaN(amt) || amt <= 0) return;

    addObligation({
      name: newObName.trim(),
      amount: amt,
      category: newObCat
    });
    setNewObName('');
    setNewObAmount('');
  };

  const handleExport = () => {
    const jsonStr = exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spendpulse_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = importBackup(text);
      if (success) {
        setImportStatus('Backup restored successfully!');
      } else {
        setImportStatus('Invalid backup file.');
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* 1. Monthly Income Setup */}
      <div className="p-4 rounded-2xl glass-card space-y-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Monthly Take-Home Income
          </h3>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-indigo-400 font-mono">
              {currency}
            </span>
            <input
              type="number"
              value={editIncome}
              onChange={(e) => setEditIncome(Number(e.target.value))}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <button
            onClick={handleUpdateIncome}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
          >
            Update
          </button>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400">Currency Symbol</span>
          <div className="flex gap-1">
            {['₹', '$', '€', '£'].map((c) => (
              <button
                key={c}
                onClick={() => updateProfile({ currency: c })}
                className={`w-7 h-7 rounded-lg text-xs font-bold border transition-colors ${
                  currency === c
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Fixed Obligations & EMIs Manager */}
      <div className="p-4 rounded-2xl glass-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Fixed Obligations (EMIs / Rent)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">Deducted 1st</span>
        </div>

        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {obligations.map((ob) => (
            <div
              key={ob.id}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs"
            >
              <div>
                <span className="font-semibold text-slate-200">{ob.name}</span>
                <span className="text-[10px] text-slate-400 ml-1.5">({ob.category})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-300">
                  {formatCurrency(ob.amount, currency)}
                </span>
                <button
                  onClick={() => removeObligation(ob.id)}
                  className="text-slate-500 hover:text-rose-400 p-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new obligation mini-form */}
        <div className="pt-2 border-t border-slate-800 flex gap-1.5">
          <input
            type="text"
            placeholder="Name (e.g. EMI)"
            value={newObName}
            onChange={(e) => setNewObName(e.target.value)}
            className="flex-1 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
          />
          <input
            type="number"
            placeholder="Amount"
            value={newObAmount}
            onChange={(e) => setNewObAmount(e.target.value)}
            className="w-24 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
          />
          <button
            onClick={handleAddObligation}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      {/* 3. Native App (Android / iPhone) Packaging Ready */}
      <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950/70 border border-indigo-500/30 space-y-2.5">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Mobile Native App Build
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Pre-configured with <strong>Capacitor</strong>. You can export this directly into native Android Studio and iOS Xcode projects:
        </p>
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-indigo-300 space-y-1">
          <div>npm run build</div>
          <div>npx cap add android &amp;&amp; npx cap open android</div>
          <div>npx cap add ios &amp;&amp; npx cap open ios</div>
        </div>
      </div>

      {/* 4. Data Management & Backup */}
      <div className="p-4 rounded-2xl glass-card space-y-2.5">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Data & Privacy (100% Offline)
        </h3>

        {importStatus && (
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs text-center border border-indigo-500/30 font-medium">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExport}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Backup</span>
          </button>

          <label className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Restore JSON</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onRerunOnboarding}
            className="flex-1 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
          >
            Re-run Setup Wizard
          </button>
          <button
            onClick={loadSampleData}
            className="flex-1 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
          >
            Load Demo Data
          </button>
        </div>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all budget and transaction data?')) {
              resetAllData();
            }
          }}
          className="w-full py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset All Data
        </button>
      </div>
    </div>
  );
};
