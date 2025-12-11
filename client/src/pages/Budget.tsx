import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useToast } from '../utils/toast';

interface Budget {
  _id: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
}

const BudgetPage = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Food',
    limit: ''
  });
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/budget');
      setBudgets(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      showError('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await axios.post('/api/budget', formData);
      setShowForm(false);
      setFormData({ category: 'Food', limit: '' });
      showSuccess('Budget set successfully!');
      fetchBudgets();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to set budget');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this budget?')) {
      try {
        await axios.delete(`/api/budget/${id}`);
        showSuccess('Budget deleted successfully');
        fetchBudgets();
      } catch (error) {
        showError('Failed to delete budget');
      }
    }
  };

  const getBudgetTextColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-slate-700';
    return 'text-blue-600';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 100) return '🚨';
    if (percentage >= 90) return '⚠️';
    if (percentage >= 75) return '💡';
    return '✅';
  };

  const getStatusMessage = (percentage: number) => {
    if (percentage >= 100) return 'Budget exceeded';
    if (percentage >= 90) return 'Almost at limit';
    if (percentage >= 75) return 'Approaching limit';
    return 'On track';
  };

  // Calculate total budget and spending
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
            <span className="text-2xl">🎯</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-blue-500 mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-2xl text-white">🎯</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Budget Management
              </h1>
              <p className="text-slate-600 mt-1">
                Set spending limits and track your financial goals
              </p>
            </div>
          </div>
          
          {/* Budget Summary Card */}
          {budgets.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center md:text-left">
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Budget</p>
                  <p className="text-2xl font-bold text-slate-900">${totalBudget.toFixed(2)}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-slate-700">${totalSpent.toFixed(2)}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm font-medium text-slate-500 mb-1">Remaining</p>
                  <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    ${totalRemaining.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  {showForm ? '✕ Cancel' : '+ Set New Budget'}
                </button>
              </div>
            </div>
          )}
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">✏️</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Set Category Budget</h2>
                <p className="text-slate-600 text-sm">Define spending limits for better financial control</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-700 mb-2 font-medium">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option>Food</option>
                    <option>Transport</option>
                    <option>Entertainment</option>
                    <option>Shopping</option>
                    <option>Bills</option>
                    <option>Rent</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-2 font-medium">Monthly Limit ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Set Budget
              </button>
            </form>
          </div>
        )}

        {/* Budget Cards */}
        <div className={`grid gap-6 mb-8 ${
          budgets.length === 1 ? 'grid-cols-1' :
          budgets.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {budgets.map((budget) => (
            <div key={budget._id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{getStatusIcon(budget.percentage)}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{budget.category}</h3>
                      <p className="text-sm text-slate-500">Monthly Budget</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${getBudgetTextColor(budget.percentage)}`}>
                      {budget.percentage.toFixed(0)}%
                    </p>
                    <p className="text-xs text-slate-500">
                      {getStatusMessage(budget.percentage)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        budget.percentage >= 100 ? 'bg-red-500' :
                        budget.percentage >= 90 ? 'bg-red-500' :
                        budget.percentage >= 75 ? 'bg-slate-400' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Spent</p>
                      <p className="font-semibold text-slate-900">${budget.spent.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Limit</p>
                      <p className="font-semibold text-slate-900">${budget.limit.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Remaining</p>
                      <p className={`font-semibold ${budget.remaining >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        ${budget.remaining.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {budget.percentage >= 90 && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs text-red-700 font-medium flex items-center gap-2">
                      <span>{budget.percentage >= 100 ? '🚨' : '⚠️'}</span>
                      {budget.percentage >= 100 
                        ? 'You have exceeded your budget limit'
                        : 'Budget limit almost reached - consider reducing spending'
                      }
                    </p>
                  </div>
                )}

                <button
                  onClick={() => handleDelete(budget._id)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg transition-colors font-medium"
                >
                  Remove Budget
                </button>
              </div>
            </div>
          ))}
        </div>

        {budgets.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center mb-8">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No budgets set yet</h3>
            <p className="text-slate-600 mb-6">Set monthly spending limits for different categories to stay on track with your financial goals</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Set Your First Budget
            </button>
          </div>
        )}

        {/* Tips Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">💡</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Budget Tips</h3>
              <p className="text-slate-600 text-sm">Smart strategies for effective budgeting</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Set realistic budgets based on your past spending patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Review and adjust your budgets monthly as needed</span>
              </li>
            </ul>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Track your progress regularly to stay motivated</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;