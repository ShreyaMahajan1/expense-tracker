import { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ReceiptScanner from '../components/ReceiptScanner';
import { format } from 'date-fns';
import { useToast } from '../utils/toast';

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
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
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
  const [scannedItems, setScannedItems] = useState<Array<{ name: string; price: number; quantity?: number }>>([]);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/expenses');
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      showError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const handleReceiptScanned = (data: {
    amount: string;
    description: string;
    category: string;
    items: Array<{ name: string; price: number; quantity?: number }>;
  }) => {
    setFormData({
      ...formData,
      amount: data.amount,
      description: data.description,
      category: data.category,
      notes: `Scanned items: ${data.items.map(item => `${item.name} (${item.price})`).join(', ')}`
    });
    setScannedItems(data.items);
    setShowReceiptScanner(false);
    setShowForm(true); // Auto-open the add expense form
    showSuccess('Receipt scanned! Review the details and save your expense.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
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
      setShowReceiptScanner(false);
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
      setScannedItems([]);
      
      showSuccess('Expense added successfully!');
      fetchExpenses();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to add expense');
    }
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

  // Memoized calculations
  const totalExpenses = useMemo(() => 
    expenses.reduce((sum, expense) => sum + expense.amount, 0), 
    [expenses]
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
            <span className="text-2xl">💸</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-blue-500 mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your expenses...</p>
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
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-2xl text-white">💸</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-slate-900">
                Expenses
              </h1>
              <p className="text-slate-600 mt-1">
                Track and manage your spending
              </p>
            </div>
          </div>
          
          {/* Total Expenses Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500 mb-1">Total Expenses This Month</p>
                <p className="text-lg sm:text-3xl font-bold text-slate-900">${totalExpenses.toFixed(2)}</p>
                <p className="text-sm text-slate-500 mt-1">{expenses.length} transactions</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setShowReceiptScanner(!showReceiptScanner);
                    setShowForm(false);
                  }}
                  className="bg-slate-600 text-white px-4 py-2.5 rounded-lg hover:bg-slate-700 transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <span className="text-base">📄</span>
                  <span>{showReceiptScanner ? 'Cancel' : 'Scan Receipt'}</span>
                </button>
                <button
                  onClick={() => {
                    setShowForm(!showForm);
                    setShowReceiptScanner(false);
                  }}
                  className="bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <span className="text-base">+</span>
                  <span>{showForm ? 'Cancel' : 'Add Expense'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {showReceiptScanner && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📄</span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Scan Receipt</h2>
                <p className="text-slate-600 text-sm">Upload a receipt to automatically extract expense details</p>
              </div>
            </div>
            
            <ReceiptScanner
              onReceiptScanned={handleReceiptScanned}
              onFileSelected={setReceipt}
            />
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">{scannedItems.length > 0 ? '📄' : '✏️'}</span>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    {scannedItems.length > 0 ? 'Review Scanned Expense' : 'Add New Expense'}
                  </h2>
                  <p className="text-slate-600 text-sm">
                    {scannedItems.length > 0 ? 'Verify the extracted data and save' : 'Enter your expense details'}
                  </p>
                </div>
              </div>
              {scannedItems.length > 0 && (
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  ✅ Scanned Data
                </span>
              )}
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
              </div>

              <div>
                <label className="block text-slate-700 mb-2 font-medium">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="What did you spend on?"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div>
                  <label className="block text-slate-700 mb-2 font-medium">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Card</option>
                    <option>Net Banking</option>
                    <option>Wallet</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="recurring" className="text-slate-700 font-medium">
                  Recurring expense (e.g., rent, subscriptions)
                </label>
              </div>

              {formData.isRecurring && (
                <div>
                  <label className="block text-slate-700 mb-2 font-medium">Recurring Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.recurringDay}
                    onChange={(e) => setFormData({ ...formData, recurringDay: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., 1 for 1st of every month"
                  />
                </div>
              )}

              {scannedItems.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">📋 Scanned Items</h3>
                  <div className="space-y-2">
                    {scannedItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-white rounded-lg p-3 text-sm">
                        <span className="font-medium text-slate-700">{item.name}</span>
                        <div className="flex items-center gap-2 text-slate-600">
                          {item.quantity && <span>×{item.quantity}</span>}
                          <span className="font-semibold">${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center font-bold text-blue-900">
                        <span>Total:</span>
                        <span>${scannedItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-700 mb-2 font-medium">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  rows={3}
                  placeholder="Any additional notes..."
                />
              </div>

              {!scannedItems.length && (
                <div>
                  <label className="block text-slate-700 mb-2 font-medium">Receipt (optional)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <label
                      htmlFor="receipt-upload"
                      className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
                    >
                      <div className="text-center">
                        <span className="text-3xl block mb-2">📁</span>
                        <span className="text-sm font-medium text-slate-700">
                          {receipt ? receipt.name : 'Choose receipt image'}
                        </span>
                        <span className="text-xs text-slate-500 block mt-1">
                          PNG, JPG up to 5MB
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Add Expense
              </button>
            </form>
          </div>
        )}

        {/* Expenses List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expenses.map((expense) => (
            <div key={expense._id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900">{expense.description}</h3>
                      <p className="text-sm text-slate-500">{format(new Date(expense.date), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  {expense.isRecurring && (
                    <span className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full font-medium">
                      🔄 Recurring
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg sm:text-2xl font-bold text-slate-900">${expense.amount.toFixed(2)}</span>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>{getPaymentIcon(expense.paymentMethod)}</span>
                    <span>{expense.paymentMethod}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-sm bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">
                    {expense.category}
                  </span>
                  <button
                    onClick={() => handleDelete(expense._id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>

                {expense.notes && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-600">
                      📝 {expense.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {expenses.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">💸</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">No expenses yet</h3>
            <p className="text-slate-600 mb-6">Start tracking your spending by adding your first expense</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
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