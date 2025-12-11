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
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
              <span className="text-3xl">💎</span>
            </div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your financial journey...</p>
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
    if (percentage >= 90) return 'bg-gradient-to-r from-red-500 to-pink-500';
    if (percentage >= 75) return 'bg-gradient-to-r from-orange-500 to-yellow-500';
    return 'bg-gradient-to-r from-green-500 to-emerald-500';
  };

  const getBudgetTextColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-3 sm:mb-4">
            Your Financial Journey
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            Track your spending, celebrate your savings, and make every penny count ✨
          </p>
        </div>

        {/* Budget Alerts */}
        <BudgetAlert />

        {/* Top Stats Cards - Pinterest Style Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="card-hover glass p-4 sm:p-6 lg:p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl sm:text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  💰
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Income</h3>
                  <p className="text-xs text-gray-500">{analytics.incomeCount} transactions</p>
                </div>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">${analytics.totalIncome.toFixed(2)}</p>
            </div>
          </div>

          <div className="card-hover glass p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/20 to-pink-500/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  💸
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
                  <p className="text-xs text-gray-500">{analytics.expenseCount} transactions</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">${analytics.totalExpense.toFixed(2)}</p>
            </div>
          </div>

          <div className="card-hover glass p-8 rounded-3xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-20 h-20 ${analytics.balance >= 0 ? 'bg-gradient-to-br from-green-400/20 to-emerald-500/20' : 'bg-gradient-to-br from-orange-400/20 to-red-500/20'} rounded-full -mr-10 -mt-10`}></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl ${analytics.balance >= 0 ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-orange-500 to-red-500'} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {analytics.balance >= 0 ? '✨' : '⚠️'}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Balance</h3>
                  <p className="text-xs text-gray-500">Income - Expenses</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">${analytics.balance.toFixed(2)}</p>
            </div>
          </div>

          <div className="card-hover glass p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {analytics.changePercent > 0 ? '📈' : '📉'}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">vs Last Month</h3>
                  <p className="text-xs text-gray-500">Last: ${analytics.prevMonthExpense.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">{analytics.changePercent > 0 ? '+' : ''}{analytics.changePercent.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Budget Overview - Pinterest Style */}
        {budgets.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
                🎯
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Budget Tracker</h2>
                <p className="text-gray-600">Keep your spending on track</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map((budget) => (
                <div key={budget._id} className="card-hover glass p-6 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full -mr-8 -mt-8"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{budget.category}</h3>
                        <p className="text-sm text-gray-600">
                          ${budget.spent.toFixed(2)} of ${budget.limit.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getBudgetTextColor(budget.percentage)}`}>
                          {budget.percentage.toFixed(0)}%
                        </p>
                        <p className="text-xs text-gray-500">
                          ${budget.remaining.toFixed(2)} left
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="w-full bg-gray-200/50 rounded-full h-4 overflow-hidden backdrop-blur-sm">
                        <div
                          className={`h-full ${getBudgetColor(budget.percentage)} transition-all duration-500 ease-out rounded-full`}
                          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        ></div>
                      </div>
                      
                      {budget.percentage >= 90 && (
                        <div className="mt-3 p-3 bg-red-50/80 rounded-2xl border border-red-200/50 backdrop-blur-sm">
                          <p className="text-xs text-red-700 font-medium flex items-center gap-2">
                            <span className="animate-pulse">⚠️</span>
                            Budget limit almost reached!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Section - Pinterest Masonry Style */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl shadow-lg">
              📊
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Spending Insights</h2>
              <p className="text-gray-600">Understand your money patterns</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category Breakdown */}
            <div className="card-hover glass p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-purple-500/20 rounded-full -mr-12 -mt-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-lg">
                    🥧
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Spending by Category</h3>
                </div>
                
                {categoryData.length > 0 ? (
                  <div className="bg-white/50 rounded-2xl p-4 backdrop-blur-sm">
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
                        <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4 opacity-50">📊</div>
                    <p className="text-gray-500 text-lg">No expenses yet</p>
                    <p className="text-gray-400 text-sm">Start tracking to see insights</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="card-hover glass p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full -mr-12 -mt-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-lg">
                    💳
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Payment Methods</h3>
                </div>
                
                {paymentData.length > 0 ? (
                  <div className="bg-white/50 rounded-2xl p-4 backdrop-blur-sm">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={paymentData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                        <Bar dataKey="value" fill="url(#colorGradient)" radius={[12, 12, 0, 0]} />
                        <defs>
                          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.8}/>
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4 opacity-50">💳</div>
                    <p className="text-gray-500 text-lg">No payment data</p>
                    <p className="text-gray-400 text-sm">Add expenses to see breakdown</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Daily Spending Trend - Full Width */}
        <div className="card-hover glass p-8 rounded-3xl relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full -mr-16 -mt-16"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-2xl shadow-lg">
                📈
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Daily Spending Trend</h2>
                <p className="text-gray-600">Track your daily spending patterns</p>
              </div>
            </div>
            
            {dailyData.length > 0 ? (
              <div className="bg-white/50 rounded-2xl p-6 backdrop-blur-sm">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={dailyData}>
                    <XAxis 
                      dataKey="day" 
                      label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
                      stroke="#6B7280"
                    />
                    <YAxis 
                      label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
                      stroke="#6B7280"
                    />
                    <Tooltip 
                      formatter={(value: any) => [`$${value.toFixed(2)}`, 'Amount']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="url(#lineGradient)" 
                      strokeWidth={3} 
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
                    />
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-8xl mb-6 opacity-50">📈</div>
                <p className="text-gray-500 text-xl">No daily data available</p>
                <p className="text-gray-400">Start adding expenses to see trends</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats - Pinterest Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-hover glass p-6 rounded-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full -mr-8 -mt-8"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl shadow-lg">
                📊
              </div>
              <p className="text-gray-600 text-sm font-medium mb-2">Avg Daily Spend</p>
              <p className="text-2xl font-bold text-gray-800">
                ${(analytics.totalExpense / new Date().getDate()).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="card-hover glass p-6 rounded-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full -mr-8 -mt-8"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg">
                🏆
              </div>
              <p className="text-gray-600 text-sm font-medium mb-2">Top Category</p>
              <p className="text-lg font-bold text-gray-800 truncate">
                {categoryData.length > 0 ? categoryData.sort((a, b) => b.value - a.value)[0].name : 'N/A'}
              </p>
            </div>
          </div>

          <div className="card-hover glass p-6 rounded-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full -mr-8 -mt-8"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-2xl shadow-lg">
                🔄
              </div>
              <p className="text-gray-600 text-sm font-medium mb-2">Transactions</p>
              <p className="text-2xl font-bold text-gray-800">
                {analytics.expenseCount + analytics.incomeCount}
              </p>
            </div>
          </div>

          <div className="card-hover glass p-6 rounded-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full -mr-8 -mt-8"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl shadow-lg">
                💎
              </div>
              <p className="text-gray-600 text-sm font-medium mb-2">Savings Rate</p>
              <p className="text-2xl font-bold text-gray-800">
                {analytics.totalIncome > 0 ? ((analytics.balance / analytics.totalIncome) * 100).toFixed(0) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;