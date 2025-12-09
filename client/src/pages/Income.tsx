import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { format } from 'date-fns';

interface Income {
  _id: string;
  amount: number;
  source: string;
  description: string;
  date: string;
}

const Income = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    source: 'Salary',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    const response = await axios.get('/api/income');
    setIncomes(response.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('/api/income', formData);
    setShowForm(false);
    setFormData({
      amount: '',
      source: 'Salary',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    fetchIncomes();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this income?')) {
      await axios.delete(`/api/income/${id}`);
      fetchIncomes();
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Income</h1>
            <p className="text-gray-600 mt-1">Track your income sources</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-green-700 transition w-full md:w-auto"
          >
            {showForm ? 'Cancel' : '+ Add Income'}
          </button>
        </div>

        {/* Total Income Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg mb-6">
          <h3 className="text-sm font-medium opacity-90 mb-2">Total Income This Month</h3>
          <p className="text-4xl font-bold">${totalIncome.toFixed(2)}</p>
          <p className="text-sm opacity-75 mt-2">{incomes.length} income sources</p>
        </div>

        {showForm && (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">New Income</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                <label className="block text-gray-700 mb-2 font-medium">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Monthly salary, Project payment"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Add Income
              </button>
            </form>
          </div>
        )}

        {/* Income List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {incomes.map((income) => (
            <div key={income._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{getSourceIcon(income.source)}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{income.description}</h3>
                    <p className="text-xs text-gray-500">{format(new Date(income.date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-green-600">+${income.amount.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
                    {income.source}
                  </span>
                  <button
                    onClick={() => handleDelete(income._id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {incomes.length === 0 && (
          <div className="bg-white p-12 rounded-xl shadow-md text-center">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">No income recorded yet</h3>
            <p className="text-gray-500 mb-6">Start tracking your income sources</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
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
