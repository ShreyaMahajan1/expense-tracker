import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

interface Analytics {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  prevMonthExpense: number;
  changePercent: number;
  categoryBreakdown: Record<string, number>;
  paymentMethodBreakdown: Record<string, number>;
  dailySpending: Record<string, number>;
  expenseCount: number;
  incomeCount: number;
}

interface Budget {
  _id: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

const Dashboard = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, budgetsRes] = await Promise.all([
        axios.get('/api/analytics/summary'),
        axios.get('/api/budget')
      ]);
      setAnalytics(analyticsRes.data);
      setBudgets(budgetsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const categoryData = Object.entries(analytics.categoryBreakdown).map(([name, value]) => ({
    name,
    value
  }));

  const paymentData = Object.entries(analytics.paymentMethodBreakdown).map(([name, value]) => ({
    name,
    value
  }));

  const dailyData = Object.entries(analytics.dailySpending)
    .map(([day, amount]) => ({
      day: parseInt(day),
      amount
    }))
    .sort((a, b) => a.day - b.day);

  const getBudgetColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getBudgetTextColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Dashboard</h1>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Income</h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold">${analytics.totalIncome.toFixed(2)}</p>
            <p className="text-xs opacity-75 mt-1">{analytics.incomeCount} transactions</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Expenses</h3>
              <span className="text-2xl">💸</span>
            </div>
            <p className="text-3xl font-bold">${analytics.totalExpense.toFixed(2)}</p>
            <p className="text-xs opacity-75 mt-1">{analytics.expenseCount} transactions</p>
          </div>

          <div className={`bg-gradient-to-br ${analytics.balance >= 0 ? 'from-green-500 to-green-600' : 'from-orange-500 to-orange-600'} text-white p-6 rounded-xl shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Balance</h3>
              <span className="text-2xl">{analytics.balance >= 0 ? '✅' : '⚠️'}</span>
            </div>
            <p className="text-3xl font-bold">${analytics.balance.toFixed(2)}</p>
            <p className="text-xs opacity-75 mt-1">Income - Expenses</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">vs Last Month</h3>
              <span className="text-2xl">{analytics.changePercent > 0 ? '📈' : '📉'}</span>
            </div>
            <p className="text-3xl font-bold">{analytics.changePercent > 0 ? '+' : ''}{analytics.changePercent.toFixed(1)}%</p>
            <p className="text-xs opacity-75 mt-1">
              Last: ${analytics.prevMonthExpense.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Budget Alerts */}
        {budgets.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4">Budget Overview</h2>
            <div className="space-y-4">
              {budgets.map((budget) => (
                <div key={budget._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-semibold">{budget.category}</h3>
                      <p className="text-sm text-gray-600">
                        ${budget.spent.toFixed(2)} of ${budget.limit.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getBudgetTextColor(budget.percentage)}`}>
                        {budget.percentage.toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        ${budget.remaining.toFixed(2)} left
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${getBudgetColor(budget.percentage)} transition-all duration-300`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    ></div>
                  </div>
                  {budget.percentage >= 90 && (
                    <p className="text-xs text-red-600 mt-2 font-medium">⚠️ Budget limit almost reached!</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Spending by Category</h2>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No expenses yet</p>
            )}
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Payment Methods</h2>
            {paymentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                  <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No payment data</p>
            )}
          </div>
        </div>

        {/* Daily Spending Trend */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Daily Spending Trend</h2>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <XAxis dataKey="day" label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No daily data available</p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-600 text-sm">Avg Daily Spend</p>
            <p className="text-2xl font-bold text-blue-600">
              ${(analytics.totalExpense / new Date().getDate()).toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-600 text-sm">Highest Category</p>
            <p className="text-2xl font-bold text-purple-600">
              {categoryData.length > 0 ? categoryData.sort((a, b) => b.value - a.value)[0].name : 'N/A'}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-600 text-sm">Transactions</p>
            <p className="text-2xl font-bold text-green-600">
              {analytics.expenseCount + analytics.incomeCount}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-600 text-sm">Savings Rate</p>
            <p className="text-2xl font-bold text-orange-600">
              {analytics.totalIncome > 0 ? ((analytics.balance / analytics.totalIncome) * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
