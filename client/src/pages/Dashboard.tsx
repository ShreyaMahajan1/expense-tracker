import { useEffect, useState } from 'react';
import axios from '../config/axios';
import Navbar from '../components/Navbar';
import BudgetAlert from '../components/BudgetAlert';
import { showError } from '../utils/toast';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

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

const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#1E40AF', '#1D4ED8', '#2563EB'];

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
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
            <span className="text-2xl">📊</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-blue-500 mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
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

  const getBudgetTextColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-slate-700';
    return 'text-blue-600';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-2xl text-white">📊</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Financial Dashboard
              </h1>
              <p className="text-slate-600 mt-1">
                Your complete financial overview at a glance
              </p>
            </div>
          </div>
        </div>

        {/* Budget Alerts */}
        <BudgetAlert />

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-500">Total Income</p>
                <p className="text-xs text-slate-400">{analytics.incomeCount} transactions</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-600">${analytics.totalIncome.toFixed(2)}</p>
              <p className="text-sm text-slate-500">This month</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💸</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-500">Total Expenses</p>
                <p className="text-xs text-slate-400">{analytics.expenseCount} transactions</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-slate-700">${analytics.totalExpense.toFixed(2)}</p>
              <p className="text-sm text-slate-500">This month</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${analytics.balance >= 0 ? 'bg-blue-50' : 'bg-slate-100'} rounded-xl flex items-center justify-center`}>
                <span className="text-2xl">{analytics.balance >= 0 ? '✨' : '⚠️'}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-500">Net Balance</p>
                <p className="text-xs text-slate-400">Income - Expenses</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${analytics.balance >= 0 ? 'text-blue-600' : 'text-slate-700'}`}>
                ${analytics.balance.toFixed(2)}
              </p>
              <p className="text-sm text-slate-500">Current balance</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">{analytics.changePercent > 0 ? '📈' : '📉'}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-500">Monthly Change</p>
                <p className="text-xs text-slate-400">vs last month</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-slate-700">
                {analytics.changePercent > 0 ? '+' : ''}{analytics.changePercent.toFixed(1)}%
              </p>
              <p className="text-sm text-slate-500">Last: ${analytics.prevMonthExpense.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Budget Overview */}
        {budgets.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Budget Overview</h2>
                <p className="text-slate-600 text-sm">Track your spending against set limits</p>
              </div>
            </div>
            
            <div className={`grid gap-6 ${
              budgets.length === 1 ? 'grid-cols-1' :
              budgets.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {budgets.map((budget) => (
                <div key={budget._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900">{budget.category}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        ${budget.spent.toFixed(2)} of ${budget.limit.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${getBudgetTextColor(budget.percentage)}`}>
                        {budget.percentage.toFixed(0)}%
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        ${budget.remaining.toFixed(2)} remaining
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 transition-all duration-500 rounded-full ${
                          budget.percentage >= 90 ? 'bg-red-500' :
                          budget.percentage >= 75 ? 'bg-slate-400' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      ></div>
                    </div>
                    
                    {budget.percentage >= 90 && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-xs text-red-700 font-medium flex items-center gap-2">
                          <span>⚠️</span>
                          Budget limit almost reached
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🥧</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Spending by Category</h3>
                <p className="text-slate-600 text-sm">Where your money goes</p>
              </div>
            </div>
            
            {categoryData.length > 0 ? (
              <div className="bg-slate-50 rounded-lg p-4">
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
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`$${value.toFixed(2)}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 opacity-40">📊</div>
                <p className="text-slate-500 font-medium">No expenses recorded yet</p>
                <p className="text-slate-400 text-sm mt-1">Start tracking to see your spending patterns</p>
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">💳</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Payment Methods</h3>
                <p className="text-slate-600 text-sm">How you spend your money</p>
              </div>
            </div>
            
            {paymentData.length > 0 ? (
              <div className="bg-slate-50 rounded-lg p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={paymentData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      formatter={(value: any) => [`$${value.toFixed(2)}`, 'Amount']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 opacity-40">💳</div>
                <p className="text-slate-500 font-medium">No payment data available</p>
                <p className="text-slate-400 text-sm mt-1">Add expenses to see payment breakdown</p>
              </div>
            )}
          </div>
        </div>

        {/* Daily Spending Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📈</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Daily Spending Trend</h2>
              <p className="text-slate-600 text-sm">Your spending patterns throughout the month</p>
            </div>
          </div>
          
          {dailyData.length > 0 ? (
            <div className="bg-slate-50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={dailyData}>
                  <XAxis 
                    dataKey="day" 
                    stroke="#64748b"
                    fontSize={12}
                    label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`$${value.toFixed(2)}`, 'Amount']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3B82F6" 
                    strokeWidth={3} 
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 opacity-40">📈</div>
              <p className="text-slate-500 font-medium text-lg">No daily data available</p>
              <p className="text-slate-400 mt-2">Start adding expenses to see your spending trends</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 mx-auto mb-4 bg-blue-50 rounded-xl flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-2">Daily Average</p>
            <p className="text-xl font-bold text-blue-600">
              ${(analytics.totalExpense / new Date().getDate()).toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 mx-auto mb-4 bg-slate-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">🏆</span>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-2">Top Category</p>
            <p className="text-lg font-bold text-slate-700 truncate">
              {categoryData.length > 0 ? categoryData.sort((a, b) => b.value - a.value)[0].name : 'None'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 mx-auto mb-4 bg-slate-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">🔄</span>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-2">Total Transactions</p>
            <p className="text-xl font-bold text-slate-700">
              {analytics.expenseCount + analytics.incomeCount}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 mx-auto mb-4 bg-slate-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">💎</span>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-2">Savings Rate</p>
            <p className="text-xl font-bold text-slate-700">
              {analytics.totalIncome > 0 ? ((analytics.balance / analytics.totalIncome) * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;