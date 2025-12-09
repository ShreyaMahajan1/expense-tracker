import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { format } from 'date-fns';

interface Expense {
  _id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  receiptUrl?: string;
  paymentMethod: string;
  isRecurring: boolean;
  recurringDay?: number;
  notes?: string;
}

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    isRecurring: false,
    recurringDay: '',
    notes: ''
  });
  const [receipt, setReceipt] = useState<File | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const response = await axios.get('/api/expenses');
    setExpenses(response.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('amount', formData.amount);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('date', formData.date);
    data.append('paymentMethod', formData.paymentMethod);
    data.append('isRecurring', formData.isRecurring.toString());
    if (formData.recurringDay) data.append('recurringDay', formData.recurringDay);
    if (formData.notes) data.append('notes', formData.notes);
    if (receipt) data.append('receipt', receipt);

    await axios.post('/api/expenses', data);
    setShowForm(false);
    setFormData({
      amount: '',
      description: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      isRecurring: false,
      recurringDay: '',
      notes: ''
    });
    setReceipt(null);
    fetchExpenses();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this expense?')) {
      await axios.delete(`/api/expenses/${id}`);
      fetchExpenses();
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      Food: '🍔',
      Transport: '🚗',
      Entertainment: '🎬',
      Shopping: '🛍️',
      Bills: '💡',
      Rent: '🏠',
      Other: '📱'
    };
    return icons[category] || '📝';
  };

  const getPaymentIcon = (method: string) => {
    const icons: Record<string, string> = {
      Cash: '💵',
      UPI: '📱',
      Card: '💳',
      'Net Banking': '🏦',
      Wallet: '👛'
    };
    return icons[method] || '💰';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">My Expenses</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-blue-700 transition w-full md:w-auto"
          >
            {showForm ? 'Cancel' : '+ Add Expense'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">New Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What did you spend on?"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Card</option>
                    <option>Net Banking</option>
                    <option>Wallet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">Recurring Expense (e.g., Rent, Netflix)</span>
                </label>
              </div>

              {formData.isRecurring && (
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Recurring Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.recurringDay}
                    onChange={(e) => setFormData({ ...formData, recurringDay: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 1 for 1st of every month"
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Any additional notes..."
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Receipt (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Add Expense
              </button>
            </form>
          </div>
        )}

        {/* Expenses List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenses.map((expense) => (
            <div key={expense._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{getCategoryIcon(expense.category)}</span>
                    <div>
                      <h3 className="font-bold text-lg">{expense.description}</h3>
                      <p className="text-xs text-gray-500">{format(new Date(expense.date), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  {expense.isRecurring && (
                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                      🔄 Recurring
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-gray-800">${expense.amount.toFixed(2)}</span>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span>{getPaymentIcon(expense.paymentMethod)}</span>
                    <span>{expense.paymentMethod}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                    {expense.category}
                  </span>
                  <button
                    onClick={() => handleDelete(expense._id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>

                {expense.notes && (
                  <p className="text-xs text-gray-600 mt-3 pt-3 border-t">
                    📝 {expense.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {expenses.length === 0 && (
          <div className="bg-white p-12 rounded-xl shadow-md text-center">
            <div className="text-6xl mb-4">💸</div>
            <h3 className="text-xl font-bold mb-2">No expenses yet</h3>
            <p className="text-gray-500 mb-6">Start tracking your spending by adding your first expense</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Add First Expense
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
