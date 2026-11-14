import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserFinancialProfile,
  ExpenseTransaction,
  DailyBudgetMetrics,
  BudgetRatios,
  FixedObligation
} from '../types/budget';
import {
  loadStoredProfile,
  saveStoredProfile,
  loadStoredTransactions,
  saveStoredTransactions,
  DEFAULT_PROFILE,
  SAMPLE_TRANSACTIONS
} from '../utils/storage';
import { calculateDailyMetrics } from '../utils/calculations';

interface BudgetContextType {
  profile: UserFinancialProfile;
  transactions: ExpenseTransaction[];
  metrics: DailyBudgetMetrics;
  updateProfile: (profile: Partial<UserFinancialProfile>) => void;
  updateRatios: (ratios: BudgetRatios) => void;
  addObligation: (obligation: Omit<FixedObligation, 'id'>) => void;
  removeObligation: (id: string) => void;
  updateObligation: (obligation: FixedObligation) => void;
  addTransaction: (transaction: Omit<ExpenseTransaction, 'id' | 'timestamp'>) => void;
  deleteTransaction: (id: string) => void;
  completeOnboarding: (setupData: {
    monthlyIncome: number;
    obligations: FixedObligation[];
    ratios: BudgetRatios;
    currency: string;
  }) => void;
  resetAllData: () => void;
  loadSampleData: () => void;
  exportBackup: () => string;
  importBackup: (jsonStr: string) => boolean;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserFinancialProfile>(loadStoredProfile);
  const [transactions, setTransactions] = useState<ExpenseTransaction[]>(loadStoredTransactions);

  // Sync to local storage
  useEffect(() => {
    saveStoredProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  // Dynamically compute real-time metrics
  const metrics = useMemo(() => {
    return calculateDailyMetrics(profile, transactions);
  }, [profile, transactions]);

  const updateProfile = (changes: Partial<UserFinancialProfile>) => {
    setProfile(prev => ({ ...prev, ...changes }));
  };

  const updateRatios = (ratios: BudgetRatios) => {
    setProfile(prev => ({ ...prev, ratios }));
  };

  const addObligation = (obligationData: Omit<FixedObligation, 'id'>) => {
    const newOb: FixedObligation = {
      ...obligationData,
      id: 'ob-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)
    };
    setProfile(prev => ({
      ...prev,
      obligations: [...prev.obligations, newOb]
    }));
  };

  const removeObligation = (id: string) => {
    setProfile(prev => ({
      ...prev,
      obligations: prev.obligations.filter(ob => ob.id !== id)
    }));
  };

  const updateObligation = (updated: FixedObligation) => {
    setProfile(prev => ({
      ...prev,
      obligations: prev.obligations.map(ob => ob.id === updated.id ? updated : ob)
    }));
  };

  const addTransaction = (txnData: Omit<ExpenseTransaction, 'id' | 'timestamp'>) => {
    const newTxn: ExpenseTransaction = {
      ...txnData,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: Date.now()
    };
    setTransactions(prev => [newTxn, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const completeOnboarding = (setupData: {
    monthlyIncome: number;
    obligations: FixedObligation[];
    ratios: BudgetRatios;
    currency: string;
  }) => {
    setProfile(prev => ({
      ...prev,
      ...setupData,
      hasCompletedOnboarding: true
    }));
  };

  const resetAllData = () => {
    setProfile({
      ...DEFAULT_PROFILE,
      hasCompletedOnboarding: false
    });
    setTransactions([]);
  };

  const loadSampleData = () => {
    setProfile({
      ...DEFAULT_PROFILE,
      hasCompletedOnboarding: true
    });
    setTransactions(SAMPLE_TRANSACTIONS);
  };

  const exportBackup = (): string => {
    return JSON.stringify({ profile, transactions, exportedAt: new Date().toISOString() }, null, 2);
  };

  const importBackup = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.profile && Array.isArray(parsed.transactions)) {
        setProfile(parsed.profile);
        setTransactions(parsed.transactions);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <BudgetContext.Provider
      value={{
        profile,
        transactions,
        metrics,
        updateProfile,
        updateRatios,
        addObligation,
        removeObligation,
        updateObligation,
        addTransaction,
        deleteTransaction,
        completeOnboarding,
        resetAllData,
        loadSampleData,
        exportBackup,
        importBackup
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = (): BudgetContextType => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
