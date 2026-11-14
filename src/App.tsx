import React, { useState } from 'react';
import { BudgetProvider, useBudget } from './context/BudgetContext';
import { MobileFrame } from './components/common/MobileFrame';
import { Header } from './components/common/Header';
import { BottomNav, TabType } from './components/common/BottomNav';
import { SafeSpendHero } from './components/dashboard/SafeSpendHero';
import { WeeklyPacerCard } from './components/dashboard/WeeklyPacerCard';
import { QuickStatsRow } from './components/dashboard/QuickStatsRow';
import { CategoryBudgetProgress } from './components/dashboard/CategoryBudgetProgress';
import { RecentTransactions } from './components/dashboard/RecentTransactions';
import { AddExpenseModal } from './components/tracker/AddExpenseModal';
import { TransactionList } from './components/tracker/TransactionList';
import { BudgetAnalytics } from './components/analytics/BudgetAnalytics';
import { RatioTuner } from './components/settings/RatioTuner';
import { SettingsModal } from './components/settings/SettingsModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { NotificationToast } from './components/common/NotificationToast';

const AppContent: React.FC = () => {
  const { profile } = useBudget();
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!profile.hasCompletedOnboarding);

  return (
    <MobileFrame>
      {/* Real-time Over-Budget Notification Toast */}
      <NotificationToast />

      {/* Onboarding Wizard (shown on initial launch or when triggered) */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />

      {/* App Top Header */}
      <Header
        onOpenSettings={() => setCurrentTab('settings')}
        onOpenRatios={() => setCurrentTab('ratios')}
      />

      {/* Main Content Area based on Tab */}
      <div className="flex-1 overflow-y-auto">
        {currentTab === 'dashboard' && (
          <div className="animate-fade-in pb-16">
            <SafeSpendHero onOpenAddExpense={() => setIsAddExpenseOpen(true)} />
            <QuickStatsRow />
            <WeeklyPacerCard />
            <CategoryBudgetProgress />
            <RecentTransactions
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onViewAll={() => setCurrentTab('analytics')}
            />
          </div>
        )}

        {currentTab === 'analytics' && (
          <div className="animate-fade-in">
            <BudgetAnalytics />
          </div>
        )}

        {currentTab === 'ratios' && (
          <div className="p-4 animate-fade-in pb-20">
            <RatioTuner onSaved={() => setCurrentTab('dashboard')} />
          </div>
        )}

        {currentTab === 'settings' && (
          <div className="animate-fade-in">
            <SettingsModal onRerunOnboarding={() => setShowOnboarding(true)} />
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
      />

      {/* Rapid Expense Logger Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />
    </MobileFrame>
  );
};

export const App: React.FC = () => {
  return (
    <BudgetProvider>
      <AppContent />
    </BudgetProvider>
  );
};

export default App;
