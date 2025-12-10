import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

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
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Food',
    limit: ''
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    const response = await axios.get('/api/budget');
    setBudgets(response.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('/api/budget', formData);
    setShowForm(false);
    setFormData({ category: 'Food', limit: '' });
    fetchBudgets();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this budget?')) {
      await axios.delete(`/api/budget/${id}`);
      fetchBudgets();
    }
  };

  const getBudgetColor = (percentage: number) => {
    if (percentage >= 90) return 'from-red-500 to-red-600';
    if (percentage >= 75) return 'from-orange-500 to-orange-600';
    if (percentage >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  // const getProgressColor = (percentage: number) => {
  //   if (percentage >= 90) return 'bg-red-500';
  //   if (percentage >= 75) return 'bg-orange-500';
  //   if (percentage >= 50) return 'bg-yellow-500';
  //   return 'bg-green-500';
  // };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90) return '🚨';
    if (percentage >= 75) return '⚠️';
    if (percentage >= 50) return '⏰';
    return '✅';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Budget Management</h1>
            <p className="text-gray-600 mt-1">Set spending limits and track your budget</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-purple-700 transition w-full md:w-auto"
          >
            {showForm ? 'Cancel' : '+ Set Budget'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">Set Category Budget</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  <label className="block text-gray-700 mb-2 font-medium">Monthly Limit ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                Set Budget
              </button>
            </form>
          </div>
        )}

        {/* Budget Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <div key={budget._id} className={`bg-gradient-to-br ${getBudgetColor(budget.percentage)} text-white rounded-xl shadow-lg overflow-hidden`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{budget.category}</h3>
                    <p className="text-sm opacity-90">Monthly Budget</p>
                  </div>
                  <span className="text-3xl">{getStatusIcon(budget.percentage)}</span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Spent</span>
                    <span className="font-semibold">{budget.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm opacity-90">Spent:</span>
                    <span className="font-bold">${budget.spent.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm opacity-90">Limit:</span>
                    <span className="font-bold">${budget.limit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/30 pt-2">
                    <span className="text-sm opacity-90">Remaining:</span>
                    <span className="font-bold">${budget.remaining.toFixed(2)}</span>
                  </div>
                </div>

                {budget.percentage >= 90 && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-3">
                    <p className="text-xs font-medium">⚠️ Budget limit almost reached! Consider reducing spending.</p>
                  </div>
                )}

                <button
                  onClick={() => handleDelete(budget._id)}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-2 rounded-lg transition font-medium"
                >
                  Remove Budget
                </button>
              </div>
            </div>
          ))}
        </div>

        {budgets.length === 0 && (
          <div className="bg-white p-12 rounded-xl shadow-md text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">No budgets set yet</h3>
            <p className="text-gray-500 mb-6">Set monthly spending limits for different categories to stay on track</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Set Your First Budget
            </button>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-3 text-blue-900">💡 Budget Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Set realistic budgets based on your past spending patterns</li>
            <li>• Review and adjust your budgets monthly</li>
            <li>• Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
            <li>• Get alerts when you're close to your limit</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
