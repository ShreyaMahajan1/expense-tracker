import { useState, useEffect } from 'react';
import axios from '../config/axios';

interface BudgetStatus {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
}

const BudgetAlert = () => {
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await axios.get('/api/budget');
      setBudgets(response.data);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
    }
  };

  const getBudgetStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-100 border-red-300 text-red-800';
    if (percentage >= 90) return 'bg-orange-100 border-orange-300 text-orange-800';
    if (percentage >= 75) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-green-100 border-green-300 text-green-800';
  };

  const getBudgetIcon = (percentage: number) => {
    if (percentage >= 100) return '🚨';
    if (percentage >= 90) return '⚠️';
    if (percentage >= 75) return '💡';
    return '✅';
  };

  const criticalBudgets = budgets.filter(b => b.percentage >= 75);

  if (criticalBudgets.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <span>⚠️</span>
        Budget Alerts
      </h3>
      <div className="space-y-3">
        {criticalBudgets.map((budget) => (
          <div
            key={budget.category}
            className={`p-4 rounded-2xl border-2 ${getBudgetStatusColor(budget.percentage)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getBudgetIcon(budget.percentage)}</span>
                <div>
                  <h4 className="font-semibold">{budget.category}</h4>
                  <p className="text-sm">
                    ${budget.spent.toFixed(2)} of ${budget.limit.toFixed(2)} spent
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{budget.percentage.toFixed(1)}%</p>
                <p className="text-sm">
                  {budget.remaining > 0 ? `$${budget.remaining.toFixed(2)} left` : `$${Math.abs(budget.remaining).toFixed(2)} over`}
                </p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3">
              <div className="w-full bg-white/50 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    budget.percentage >= 100 ? 'bg-red-500' :
                    budget.percentage >= 90 ? 'bg-orange-500' :
                    budget.percentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetAlert;