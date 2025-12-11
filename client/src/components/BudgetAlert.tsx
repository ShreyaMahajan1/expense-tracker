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

  const getBudgetIcon = (percentage: number) => {
    if (percentage >= 100) return '🚨';
    if (percentage >= 90) return '⚠️';
    if (percentage >= 75) return '💡';
    return '✅';
  };

  const getBudgetTextColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-slate-700';
    return 'text-blue-600';
  };

  const getBudgetMessage = (percentage: number) => {
    if (percentage >= 100) return 'Budget exceeded';
    if (percentage >= 90) return 'Almost at limit';
    if (percentage >= 75) return 'Approaching limit';
    return 'On track';
  };

  const criticalBudgets = budgets.filter(b => b.percentage >= 75);

  if (criticalBudgets.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
          <span className="text-xl">⚠️</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Budget Alerts</h2>
          <p className="text-slate-600 text-sm">Categories that need your attention</p>
        </div>
      </div>
      
      <div className={`grid gap-6 ${
        criticalBudgets.length === 1 ? 'grid-cols-1' :
        criticalBudgets.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {criticalBudgets.map((budget) => (
          <div
            key={budget.category}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">{getBudgetIcon(budget.percentage)}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-slate-900">{budget.category}</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    ${budget.spent.toFixed(2)} of ${budget.limit.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold ${getBudgetTextColor(budget.percentage)}`}>
                  {budget.percentage.toFixed(0)}%
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {getBudgetMessage(budget.percentage)}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    budget.percentage >= 100 ? 'bg-red-500' :
                    budget.percentage >= 90 ? 'bg-red-500' :
                    budget.percentage >= 75 ? 'bg-slate-400' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  {budget.remaining > 0 ? 'Remaining' : 'Over budget'}
                </span>
                <span className={`font-medium ${
                  budget.remaining > 0 ? 'text-slate-700' : 'text-red-600'
                }`}>
                  ${Math.abs(budget.remaining).toFixed(2)}
                </span>
              </div>

              {budget.percentage >= 90 && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs text-red-700 font-medium flex items-center gap-2">
                    <span>{budget.percentage >= 100 ? '🚨' : '⚠️'}</span>
                    {budget.percentage >= 100 
                      ? 'You have exceeded your budget limit'
                      : 'Consider reducing spending in this category'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetAlert;