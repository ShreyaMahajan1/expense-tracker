import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axios from '../config/axios';

// Components
import Navbar from '../components/Navbar';
import GroupHeader from '../components/GroupHeader';
import PaymentModal from '../components/PaymentModal';

// Hooks
import { useAuth } from '../context/AuthContext';
import { useToast } from '../utils/toast';
import { useSecurity } from '../hooks/useSecurity';
import { useGroupData } from '../hooks/useGroupData';
import { usePayment } from '../hooks/usePayment';

// Types and Constants
import { TabType } from '../types/group.types';
import { TABS } from '../constants/group.constants';

const GroupDetails: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { } = useAuth();
  const { showError } = useToast();
  const { currentUserId } = useSecurity();
  
  // Custom hooks
  const { group, balances, settlements, loading, error, fetchGroupData } = useGroupData();
  
  const getCurrentUserId = (): string => currentUserId || '';
  
  const { 
    paymentModal, 
    paymentMethod, 
    transactionId, 
    setPaymentMethod, 
    setTransactionId, 
    openPaymentModal, 
    closePaymentModal, 
    markAsPaid 
  } = usePayment(getCurrentUserId, () => fetchGroupData(groupId!));

  const [activeTab, setActiveTab] = React.useState<TabType>(TABS.EXPENSES);
  const [showAddMemberForm, setShowAddMemberForm] = React.useState(false);
  const [showAddExpenseForm, setShowAddExpenseForm] = React.useState(false);
  const [memberEmail, setMemberEmail] = React.useState('');
  const [expenseData, setExpenseData] = React.useState({
    amount: '',
    description: '',
    category: 'Food'
  });

  // Memoized calculations
  const { totalSpent, perPersonShare } = useMemo(() => {
    if (!group) return { totalSpent: 0, perPersonShare: 0 };
    
    const total = group.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const perPerson = group.members.length > 0 ? total / group.members.length : 0;
    
    return { totalSpent: total, perPersonShare: perPerson };
  }, [group]);

  // Effects
  useEffect(() => {
    if (groupId) {
      fetchGroupData(groupId);
    }
  }, [groupId, fetchGroupData]);

  // Event handlers
  const handlePayNow = (balance: any) => {
    if (!groupId) return;
    openPaymentModal(balance, balances, groupId);
  };

  const handleMarkAsPaid = async () => {
    console.log('handleMarkAsPaid called');
    console.log('paymentModal:', paymentModal);
    console.log('settlements:', settlements);
    console.log('transactionId:', transactionId);
    
    try {
      const result = await markAsPaid(settlements);
      console.log('markAsPaid result:', result);
    } catch (error) {
      console.error('Error in handleMarkAsPaid:', error);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleBackToGroups = () => {
    navigate('/groups');
  };

  // Check if there's a paid settlement for this balance
  const hasCompletedPayment = (balance: any) => {
    // If the balance status is already 'settled', no need to show pay button
    if (balance.status === 'settled') {
      // console.log(`Balance for ${balance.userName} is already settled`);
      return true;
    }
    
    // Check if there are paid settlements from this user
    const userPaidSettlements = settlements.filter(settlement => 
      settlement.fromUserId._id === balance.userId && 
      settlement.status === 'paid'
    );
    
    if (userPaidSettlements.length === 0) {
      // console.log(`No paid settlements found for ${balance.userName}`);
      return false;
    }
    
    // Calculate total paid amount
    const totalPaid = userPaidSettlements.reduce((sum, settlement) => sum + settlement.amount, 0);
    const amountOwed = Math.abs(balance.balance);
    
    // console.log(`Payment check for ${balance.userName}:`, {
    //   totalPaid,
    //   amountOwed,
    //   isCompleted: totalPaid >= amountOwed,
    //   settlements: userPaidSettlements.length
    // });
    
    // If user has paid enough to cover their debt, consider it completed
    return totalPaid >= amountOwed;
  };

  const handleAddMember = async () => {
    if (!groupId || !memberEmail.trim()) return;

    try {
      await axios.post(`/api/groups/${groupId}/members`, { email: memberEmail.trim() });
      setShowAddMemberForm(false);
      setMemberEmail('');
      fetchGroupData(groupId);
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to add member');
    }
  };

  const handleAddGroupExpense = async () => {
    if (!groupId || !group || !expenseData.amount || !expenseData.description) return;

    try {
      const amount = parseFloat(expenseData.amount);
      const splitAmount = amount / group.members.length;

      const splits = group.members.map(member => ({
        userId: member.userId._id,
        amount: splitAmount
      }));

      await axios.post(`/api/groups/${groupId}/expenses`, {
        amount: expenseData.amount,
        description: expenseData.description,
        category: expenseData.category,
        splits
      });

      setShowAddExpenseForm(false);
      setExpenseData({ amount: '', description: '', category: 'Food' });
      fetchGroupData(groupId);
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to add expense');
    }
  };

  // Loading state
  if (loading || !group) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={handleBackToGroups}
            className="mb-4 card-hover glass px-4 py-3 rounded-2xl text-purple-600 hover:text-purple-800 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-300 w-fit"
          >
            <span className="text-lg">←</span>
            <span>Back to Groups</span>
          </button>
          
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                <span className="text-3xl">💎</span>
              </div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading group data...</p>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <button
          onClick={handleBackToGroups}
          className="mb-6 card-hover glass px-4 py-3 rounded-2xl text-purple-600 hover:text-purple-800 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-300 w-fit"
        >
          <span className="text-lg">←</span>
          <span>Back to Groups</span>
        </button>

        {/* Group Header */}
        <GroupHeader 
          group={group} 
          totalSpent={totalSpent} 
          perPersonShare={perPersonShare} 
        />

        {/* Tabs */}
        <div className="glass rounded-3xl shadow-lg mb-6">
          <div className="border-b border-white/20 flex overflow-x-auto scrollbar-hide">
            {Object.entries(TABS).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleTabChange(value)}
                className={`flex-1 min-w-0 px-3 sm:px-6 py-3 sm:py-4 font-semibold transition text-sm sm:text-base ${
                  activeTab === value
                    ? 'border-b-2 border-purple-500 text-purple-600 bg-white/20'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/10'
                }`}
              >
                <span className="flex items-center justify-center gap-1 sm:gap-2">
                  <span className="text-lg">
                    {value === TABS.EXPENSES && '📝'}
                    {value === TABS.BALANCES && '💰'}
                    {value === TABS.SETTLEMENTS && '💳'}
                  </span>
                  <span className="hidden sm:inline">
                    {value === TABS.EXPENSES && 'Expenses'}
                    {value === TABS.BALANCES && 'Balances'}
                    {value === TABS.SETTLEMENTS && 'Payments'}
                  </span>
                  <span className="sm:hidden">
                    {value === TABS.EXPENSES && 'Exp'}
                    {value === TABS.BALANCES && 'Bal'}
                    {value === TABS.SETTLEMENTS && 'Pay'}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={() => setShowAddExpenseForm(!showAddExpenseForm)}
                className="flex-1 btn-gradient text-white py-3 px-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-lg">{showAddExpenseForm ? '✕' : '+'}</span>
                  <span>Add Group Expense</span>
                </span>
              </button>
              <button
                onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-lg">{showAddMemberForm ? '✕' : '👥'}</span>
                  <span>Add Member</span>
                </span>
              </button>
            </div>

            {/* Add Expense Form */}
            {showAddExpenseForm && (
              <div className="card-hover glass p-4 sm:p-6 rounded-3xl shadow-lg mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full -mr-10 -mt-10"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-xl shadow-lg">
                      💰
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Add Group Expense</h3>
                      <p className="text-sm text-gray-600">Split equally among all members</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={expenseData.amount}
                        onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={expenseData.category}
                        onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="Food">🍔 Food</option>
                        <option value="Transport">🚗 Transport</option>
                        <option value="Entertainment">🎬 Entertainment</option>
                        <option value="Shopping">🛍️ Shopping</option>
                        <option value="Bills">💡 Bills</option>
                        <option value="Rent">🏠 Rent</option>
                        <option value="Other">📱 Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      value={expenseData.description}
                      onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="What's this expense for?"
                    />
                  </div>

                  {/* Split Preview */}
                  {expenseData.amount && group && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Split Preview:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.members.map((member, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm bg-white rounded-xl p-2">
                            <span className="text-gray-700">{member.userId.name}</span>
                            <span className="font-bold text-green-600">
                              ${(parseFloat(expenseData.amount) / group.members.length).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-green-200 flex justify-between font-bold">
                        <span>Total:</span>
                        <span className="text-green-600">${parseFloat(expenseData.amount).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddGroupExpense}
                      disabled={!expenseData.amount || !expenseData.description}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Expense
                    </button>
                    <button
                      onClick={() => setShowAddExpenseForm(false)}
                      className="px-6 bg-gray-200 text-gray-700 py-3 rounded-2xl hover:bg-gray-300 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Member Form */}
            {showAddMemberForm && (
              <div className="card-hover glass p-4 sm:p-6 rounded-3xl shadow-lg mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full -mr-10 -mt-10"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl shadow-lg">
                      👥
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Add Group Member</h3>
                      <p className="text-sm text-gray-600">Invite someone to join this group</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter their email address"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddMember}
                      disabled={!memberEmail.trim()}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Member
                    </button>
                    <button
                      onClick={() => setShowAddMemberForm(false)}
                      className="px-6 bg-gray-200 text-gray-700 py-3 rounded-2xl hover:bg-gray-300 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Expenses Tab */}
            {activeTab === TABS.EXPENSES && (
              <div className="space-y-3 sm:space-y-4">
                {group.expenses.length > 0 ? (
                  group.expenses.slice().reverse().map((expense) => (
                    <div key={expense._id} className="card-hover glass p-4 sm:p-5 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full -mr-8 -mt-8"></div>
                      
                      <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-1 truncate">{expense.description}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2">
                              Paid by <span className="font-medium">{expense.userId?.name}</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(expense.date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                            <p className="text-xl sm:text-2xl font-bold text-gray-800">${expense.amount.toFixed(2)}</p>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full whitespace-nowrap">
                              {expense.category}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/30">
                          <div className="flex items-center justify-between">
                            <p className="text-xs sm:text-sm text-gray-600">
                              Split equally among {group.members.length} members
                            </p>
                            <p className="text-sm sm:text-base font-semibold text-purple-600">
                              ${(expense.amount / group.members.length).toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 sm:py-16">
                    <div className="text-6xl sm:text-8xl mb-4 opacity-50">📝</div>
                    <p className="text-gray-500 text-lg sm:text-xl">No expenses yet</p>
                    <p className="text-gray-400 text-sm sm:text-base">Add an expense to get started</p>
                  </div>
                )}
              </div>
            )}

            {/* Balances Tab */}
            {activeTab === TABS.BALANCES && (
              <div className="space-y-3 sm:space-y-4">
                {balances.map((balance) => (
                  <div
                    key={balance.userId}
                    className={`card-hover glass p-4 sm:p-6 rounded-3xl relative overflow-hidden ${
                      balance.status === 'owed'
                        ? 'border-2 border-green-200/50'
                        : balance.status === 'owes'
                        ? 'border-2 border-red-200/50'
                        : 'border-2 border-gray-200/50'
                    }`}
                  >
                    <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -mr-10 -mt-10 ${
                      balance.status === 'owed'
                        ? 'bg-gradient-to-br from-green-400/20 to-emerald-500/20'
                        : balance.status === 'owes'
                        ? 'bg-gradient-to-br from-red-400/20 to-pink-500/20'
                        : 'bg-gradient-to-br from-gray-400/20 to-gray-500/20'
                    }`}></div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate">
                              {balance.userName}
                            </h3>
                            {balance.userId === getCurrentUserId() && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap">You</span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{balance.userEmail}</p>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                          <p
                            className={`text-xl sm:text-2xl font-bold ${
                              balance.status === 'owed'
                                ? 'text-green-600'
                                : balance.status === 'owes'
                                ? 'text-red-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {balance.status === 'owed' && '+'}
                            ${Math.abs(balance.balance).toFixed(2)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                            {balance.status === 'owed' && 'is owed'}
                            {balance.status === 'owes' && (balance.userId === getCurrentUserId() ? 'you owe' : 'owes')}
                            {balance.status === 'settled' && 'settled up'}
                          </p>
                        </div>
                      </div>
                      {balance.userId === getCurrentUserId() && (
                        <>
                          {balance.status === 'settled' || hasCompletedPayment(balance) ? (
                            <div className="mt-4 w-full bg-green-100 border-2 border-green-300 text-green-800 py-3 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base text-center">
                              <span className="flex items-center justify-center gap-2">
                                <span className="text-lg">✅</span>
                                <span>Settled</span>
                              </span>
                            </div>
                          ) : balance.status === 'owes' ? (
                            <button
                              onClick={() => handlePayNow(balance)}
                              className="mt-4 w-full btn-gradient text-white py-3 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <span className="flex items-center justify-center gap-2">
                                <span className="text-lg">💳</span>
                                <span>Pay Now via UPI</span>
                              </span>
                            </button>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {balances.length === 0 && (
                  <div className="text-center py-12 sm:py-16">
                    <div className="text-6xl sm:text-8xl mb-4 opacity-50">💰</div>
                    <p className="text-gray-500 text-lg sm:text-xl">No balances to show</p>
                    <p className="text-gray-400 text-sm sm:text-base">Add expenses to see who owes what</p>
                  </div>
                )}
              </div>
            )}

            {/* Settlements Tab */}
            {activeTab === TABS.SETTLEMENTS && (
              <div className="space-y-4">
                {settlements.map((settlement) => (
                  <div
                    key={settlement._id}
                    className={`card-hover glass p-4 sm:p-6 rounded-3xl relative overflow-hidden ${
                      settlement.status === 'paid'
                        ? 'border-2 border-green-200/50'
                        : 'border-2 border-yellow-200/50'
                    }`}
                  >
                    <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -mr-10 -mt-10 ${
                      settlement.status === 'paid'
                        ? 'bg-gradient-to-br from-green-400/20 to-emerald-500/20'
                        : 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20'
                    }`}></div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                              {settlement.fromUserId.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="text-lg">→</span>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                              {settlement.toUserId.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <p className="font-bold text-base sm:text-lg text-gray-800 mb-1">
                            {settlement.fromUserId.name} → {settlement.toUserId.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {format(new Date(settlement.createdAt), 'MMM dd, yyyy • HH:mm')}
                          </p>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                          <p className="text-xl sm:text-2xl font-bold text-gray-800">${settlement.amount.toFixed(2)}</p>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${
                              settlement.status === 'paid'
                                ? 'bg-green-100/80 text-green-700 backdrop-blur-sm'
                                : 'bg-yellow-100/80 text-yellow-700 backdrop-blur-sm'
                            }`}
                          >
                            {settlement.status === 'paid' ? '✅ Completed' : '⏳ Pending'}
                          </span>
                        </div>
                      </div>
                      
                      {settlement.status === 'paid' && settlement.paymentMethod && (
                        <div className="mt-4 pt-4 border-t border-white/30">
                          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-3 sm:p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                              <div>
                                <p className="text-gray-600 font-medium mb-1">Payment Method</p>
                                <p className="text-gray-800 font-semibold">{settlement.paymentMethod}</p>
                              </div>
                              {settlement.transactionId && (
                                <div>
                                  <p className="text-gray-600 font-medium mb-1">Transaction ID</p>
                                  <p className="text-gray-800 font-mono text-xs break-all">{settlement.transactionId}</p>
                                </div>
                              )}
                              {settlement.paidAt && (
                                <div>
                                  <p className="text-gray-600 font-medium mb-1">Paid On</p>
                                  <p className="text-gray-800 font-semibold">
                                    {format(new Date(settlement.paidAt), 'MMM dd, yyyy')}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {settlements.length === 0 && (
                  <div className="text-center py-12 sm:py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl shadow-lg opacity-50">
                      💳
                    </div>
                    <p className="text-gray-500 text-lg sm:text-xl mb-2">No payment history</p>
                    <p className="text-gray-400 text-sm sm:text-base">Payments will appear here once made</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        payeeName={paymentModal.payeeName}
        paymentAmount={paymentModal.paymentAmount}
        upiLink={paymentModal.upiLink}
        payeeUpiId={paymentModal.payeeUpiId}
        paymentMethod={paymentMethod}
        transactionId={transactionId}
        onClose={closePaymentModal}
        onPaymentMethodChange={setPaymentMethod}
        onTransactionIdChange={setTransactionId}
        onMarkAsPaid={handleMarkAsPaid}
      />
    </div>
  );
};

export default GroupDetails;
