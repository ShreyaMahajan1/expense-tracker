import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { format } from 'date-fns';
import { useToast } from '../utils/toast';

interface Income {
  _id: string;
  amount: number;
  source: string;
  description: string;
  date: string;
}

const Income = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    source: 'Salary',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/income');
      setIncomes(response.data);
    } catch (error) {
      console.error('Error fetching incomes:', error);
      showError('Failed to load income data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await axios.post('/api/income', formData);
      setShowForm(false);
      setFormData({
        amount: '',
        source: 'Salary',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      showSuccess('Income added successfully!');
      fetchIncomes();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to add income');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this income entry?')) {
      try {
        await axios.delete(`/api/income/${id}`);
        showSuccess('Income deleted successfully');
        fetchIncomes();
      } catch (error) {
        showError('Failed to delete income');
      }
    }
  };

  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);

  const getSourceIcon = (source: string) => {
    const icons: Record<string, string> = {
      Salary: '💼',
      Freelance: '💻',
      Business: '🏢',
      Investment: '📈',
      Gift: '🎁',
      Other: '💰'
    };
    return icons[source] || '💵';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
            <span className="text-2xl">💰</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-blue-500 mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your income...</p>
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
              <span className="text-2xl text-white">💰</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Income
              </h1>
              <p className="text-slate-600 mt-1">
                Track your income sources and earnings
              </p>
            </div>
          </div>
          
          {/* Total Income Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500 mb-1">Total Income This Month</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">${totalIncome.toFixed(2)}</p>
                <p className="text-sm text-slate-500 mt-1">{incomes.length} income sources</p>
              </div>
              <div className="flex">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <span className="text-base">+</span>
                  <span>{showForm ? 'Cancel' : 'Add Income'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">✏️</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Add New Income</h2>
                <p className="text-slate-600 text-sm">Record your earnings and income sources</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-700 mb-2 font-medium">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-2 font-medium">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option>Salary</option>
                    <option>Freelance</option>
                    <option>Business</option>
                    <option>Investment</option>
                    <option>Gift</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-2 font-medium">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., Monthly salary, Project payment, Dividend"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-2 font-medium">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Add Income
              </button>
            </form>
          </div>
        )}

        {/* Income List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {incomes.map((income) => (
            <div key={income._id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">{getSourceIcon(income.source)}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-900">{income.description}</h3>
                    <p className="text-sm text-slate-500">{format(new Date(income.date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-2xl font-bold text-blue-600">+${income.amount.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                    {income.source}
                  </span>
                  <button
                    onClick={() => handleDelete(income._id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {incomes.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">💰</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No income recorded yet</h3>
            <p className="text-slate-600 mb-6">Start tracking your income sources and earnings</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Add First Income
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Income;