import {
  UserFinancialProfile,
  ExpenseTransaction,
  DailyBudgetMetrics
} from '../types/budget';

export function calculateDailyMetrics(
  profile: UserFinancialProfile,
  transactions: ExpenseTransaction[],
  targetDate: Date = new Date()
): DailyBudgetMetrics {
  const totalMonthlyIncome = profile.monthlyIncome || 0;
  
  // Total fixed obligations (EMIs, rent, etc.)
  const totalObligations = (profile.obligations || []).reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  // Allocatable discretionary pool (Income - Fixed Obligations)
  const allocatablePool = Math.max(0, totalMonthlyIncome - totalObligations);

  // Categorical monthly allowances based on user ratios
  const monthlyNeedsBudget = (allocatablePool * (profile.ratios.needs || 0)) / 100;
  const monthlyFunBudget = (allocatablePool * (profile.ratios.fun || 0)) / 100;
  const monthlySavingsBudget = (allocatablePool * (profile.ratios.savings || 0)) / 100;

  // Total monthly variable budget (Needs + Fun combined)
  const monthlyVariableBudget = monthlyNeedsBudget + monthlyFunBudget;

  // Calendar metrics for the current month
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth(); // 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = targetDate.getDate(); // 1 to 31
  const daysPassedInMonth = currentDay;
  const daysRemainingInMonth = Math.max(1, daysInMonth - currentDay + 1); // including today

  // Target date YYYY-MM prefix for filtering this month's transactions
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const todayStr = `${monthPrefix}-${String(currentDay).padStart(2, '0')}`;

  // Start of current week (Monday)
  const dayOfWeek = targetDate.getDay(); // 0 is Sunday
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const mondayDate = new Date(targetDate);
  mondayDate.setDate(targetDate.getDate() + mondayOffset);
  mondayDate.setHours(0, 0, 0, 0);

  // Filter transactions for this month
  const monthTransactions = transactions.filter(t => t.date.startsWith(monthPrefix));
  
  // Filter transactions for today
  const todayTransactions = monthTransactions.filter(t => t.date === todayStr);

  // Filter transactions for this week
  const weekTransactions = monthTransactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate >= mondayDate && tDate <= targetDate;
  });

  // Calculate categorized spendings for the month
  const spentNeedsMonth = monthTransactions
    .filter(t => t.category === 'needs')
    .reduce((sum, t) => sum + t.amount, 0);

  const spentFunMonth = monthTransactions
    .filter(t => t.category === 'fun')
    .reduce((sum, t) => sum + t.amount, 0);

  // Total variable spent this month (Needs + Fun)
  const spentVariableMonth = spentNeedsMonth + spentFunMonth;
  const remainingVariableMonth = monthlyVariableBudget - spentVariableMonth;
  const remainingNeedsMonth = monthlyNeedsBudget - spentNeedsMonth;
  const remainingFunMonth = monthlyFunBudget - spentFunMonth;

  // Spendings for TODAY (Needs, Fun, and Combined)
  const spentTodayNeeds = todayTransactions
    .filter(t => t.category === 'needs')
    .reduce((sum, t) => sum + t.amount, 0);

  const spentTodayFun = todayTransactions
    .filter(t => t.category === 'fun')
    .reduce((sum, t) => sum + t.amount, 0);

  // Combined daily spending (BOTH Needs and Fun deduct from the daily budget)
  const spentToday = spentTodayNeeds + spentTodayFun;

  // Total spent today across all categories (including obligations / savings)
  const spentTotalToday = todayTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Weekly spending (Needs + Fun)
  const spentThisWeek = weekTransactions
    .filter(t => t.category === 'needs' || t.category === 'fun')
    .reduce((sum, t) => sum + t.amount, 0);

  const spentThisWeekFun = weekTransactions
    .filter(t => t.category === 'fun')
    .reduce((sum, t) => sum + t.amount, 0);

  const spentTotalThisWeek = weekTransactions.reduce((sum, t) => sum + t.amount, 0);
  const spentTotalThisMonth = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Base daily budget (Needs + Fun combined)
  const baseDailyBudget = daysInMonth > 0 ? monthlyVariableBudget / daysInMonth : 0;
  const baseDailyFunBudget = daysInMonth > 0 ? monthlyFunBudget / daysInMonth : 0;

  // Dynamic Safe-to-Spend Today (rolling calculation based on remaining pool)
  // Before today's spend was deducted from remainingVariableMonth:
  const remainingVariableBeforeToday = remainingVariableMonth + spentToday;
  const safeToSpendToday = Math.max(0, remainingVariableBeforeToday / daysRemainingInMonth);
  const remainingToday = safeToSpendToday - spentToday;

  // Over budget calculations
  const isOverBudgetToday = remainingToday < 0;
  const overBudgetAmount = isOverBudgetToday ? Math.abs(remainingToday) : 0;

  // Weekly metrics
  const currentWeekBudget = safeToSpendToday * 7;
  const remainingThisWeek = Math.max(0, currentWeekBudget - spentThisWeek);

  // Pacing Health determination
  let pacingHealth: 'great' | 'good' | 'warning' | 'danger' = 'great';
  if (safeToSpendToday <= 0 || isOverBudgetToday) {
    pacingHealth = 'danger';
  } else if (remainingToday < safeToSpendToday * 0.25) {
    pacingHealth = 'warning';
  } else if (remainingToday < safeToSpendToday * 0.6) {
    pacingHealth = 'good';
  } else {
    pacingHealth = 'great';
  }

  return {
    totalMonthlyIncome,
    totalObligations,
    allocatablePool,
    monthlyNeedsBudget,
    monthlyFunBudget,
    monthlySavingsBudget,
    monthlyVariableBudget,
    baseDailyBudget,
    spentVariableMonth,
    remainingVariableMonth,
    safeToSpendToday,
    spentToday,
    remainingToday,
    isOverBudgetToday,
    overBudgetAmount,
    spentTodayNeeds,
    spentTodayFun,
    currentWeekBudget,
    spentThisWeek,
    remainingThisWeek,
    spentNeedsMonth,
    remainingNeedsMonth,
    spentFunMonth,
    remainingFunMonth,
    baseDailyFunBudget,
    spentTodayFunOnly: spentTodayFun,
    remainingTodayFun: remainingToday,
    currentWeekFunBudget: currentWeekBudget,
    spentThisWeekFun,
    remainingThisWeekFun: remainingThisWeek,
    spentTotalToday,
    spentTotalThisWeek,
    spentTotalThisMonth,
    daysInMonth,
    daysPassedInMonth,
    daysRemainingInMonth,
    pacingHealth,
  };
}
