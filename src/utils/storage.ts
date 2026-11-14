import { UserFinancialProfile, ExpenseTransaction } from '../types/budget';
import { getTodayDateString } from './formatters';

const PROFILE_KEY = 'spendpulse_user_profile_v1';
const TRANSACTIONS_KEY = 'spendpulse_transactions_v1';

export const DEFAULT_PROFILE: UserFinancialProfile = {
  monthlyIncome: 85000,
  currency: '₹',
  obligations: [
    {
      id: 'ob-1',
      name: 'Home Loan / Rent',
      amount: 22000,
      category: 'Rent',
      dueDay: 5
    },
    {
      id: 'ob-2',
      name: 'Car / Bike EMI',
      amount: 8500,
      category: 'EMI',
      dueDay: 10
    },
    {
      id: 'ob-3',
      name: 'Term & Health Insurance',
      amount: 2500,
      category: 'Insurance',
      dueDay: 15
    }
  ],
  ratios: {
    needs: 40,
    fun: 30,
    savings: 30
  },
  hasCompletedOnboarding: false,
  budgetCycleStartDay: 1
};

export const SAMPLE_TRANSACTIONS: ExpenseTransaction[] = [
  {
    id: 'tx-1',
    amount: 180,
    category: 'fun',
    note: 'Specialty Cappuccino & Croissant',
    paymentMethod: 'UPI',
    date: getTodayDateString(),
    timestamp: Date.now() - 3600000 * 3,
    tags: ['cafe', 'coffee'],
    referenceNumber: 'UPI/432098432'
  },
  {
    id: 'tx-2',
    amount: 650,
    category: 'needs',
    note: 'Weekly Organic Veggies & Milk',
    paymentMethod: 'UPI',
    date: getTodayDateString(),
    timestamp: Date.now() - 3600000 * 5,
    tags: ['groceries'],
    referenceNumber: 'UPI/987123654'
  },
  {
    id: 'tx-3',
    amount: 320,
    category: 'fun',
    note: 'Movie Snack Combo',
    paymentMethod: 'Card',
    date: getTodayDateString(),
    timestamp: Date.now() - 3600000 * 8,
    tags: ['entertainment'],
    referenceNumber: 'TXN/CARD-9902'
  }
];

export function loadStoredProfile(): UserFinancialProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load profile', e);
    return DEFAULT_PROFILE;
  }
}

export function saveStoredProfile(profile: UserFinancialProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadStoredTransactions(): ExpenseTransaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) return SAMPLE_TRANSACTIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SAMPLE_TRANSACTIONS;
  } catch (e) {
    console.error('Failed to load transactions', e);
    return SAMPLE_TRANSACTIONS;
  }
}

export function saveStoredTransactions(transactions: ExpenseTransaction[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions', e);
  }
}
