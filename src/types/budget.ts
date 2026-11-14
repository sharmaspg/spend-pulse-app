export type BudgetCategory = 'needs' | 'fun' | 'savings' | 'obligations';

export type PaymentMethod = 'UPI' | 'Card' | 'Cash' | 'NetBanking' | 'AutoDebit';

export interface FixedObligation {
  id: string;
  name: string; // e.g. "Home Loan EMI", "Car EMI", "House Rent"
  amount: number;
  dueDay?: number; // 1 to 31
  category: 'EMI' | 'Rent' | 'Insurance' | 'Subscription' | 'Other';
}

export interface BudgetRatios {
  needs: number; // e.g. 40%
  fun: number;   // e.g. 30%
  savings: number; // e.g. 30%
}

export interface ExpenseTransaction {
  id: string;
  amount: number;
  category: BudgetCategory;
  note: string;
  paymentMethod: PaymentMethod;
  date: string; // ISO date YYYY-MM-DD
  timestamp: number;
  tags?: string[];
  referenceNumber?: string; // UPI ref / transaction ID for future automation
}

export interface UserFinancialProfile {
  monthlyIncome: number;
  currency: string; // '₹', '$', '€', '£'
  obligations: FixedObligation[];
  ratios: BudgetRatios;
  hasCompletedOnboarding: boolean;
  budgetCycleStartDay: number; // usually 1st of month
}

export interface DailyBudgetMetrics {
  totalMonthlyIncome: number;
  totalObligations: number;
  allocatablePool: number;
  
  monthlyNeedsBudget: number;
  monthlyFunBudget: number;
  monthlySavingsBudget: number;
  
  // Total variable daily pool (Needs + Fun combined)
  monthlyVariableBudget: number;
  baseDailyBudget: number;
  spentVariableMonth: number;
  remainingVariableMonth: number;

  // Safe to spend today (Combined Needs + Fun)
  safeToSpendToday: number;
  spentToday: number;
  remainingToday: number;
  isOverBudgetToday: boolean;
  overBudgetAmount: number;

  // Sub-breakdowns for today
  spentTodayNeeds: number;
  spentTodayFun: number;
  
  // Weekly metrics (Combined Needs + Fun)
  currentWeekBudget: number;
  spentThisWeek: number;
  remainingThisWeek: number;
  
  // Category month metrics
  spentNeedsMonth: number;
  remainingNeedsMonth: number;
  spentFunMonth: number;
  remainingFunMonth: number;
  
  // Backward compatibility fields
  baseDailyFunBudget: number;
  spentTodayFunOnly: number;
  remainingTodayFun: number;
  currentWeekFunBudget: number;
  spentThisWeekFun: number;
  remainingThisWeekFun: number;

  // Total spending metrics
  spentTotalToday: number;
  spentTotalThisWeek: number;
  spentTotalThisMonth: number;
  
  // Pacing status
  daysInMonth: number;
  daysPassedInMonth: number;
  daysRemainingInMonth: number;
  pacingHealth: 'great' | 'good' | 'warning' | 'danger';
}
