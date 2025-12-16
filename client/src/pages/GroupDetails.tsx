import React, { useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import axios from "../config/axios";

// Components
import Navbar from "../components/Navbar";
import GroupHeader from "../components/GroupHeader";
import PaymentModal from "../components/PaymentModal";
import ReceiptScanner from "../components/ReceiptScanner";
import AddExpenseForm from "../components/AddExpenseForm";
import AddMemberForm from "../components/AddMemberForm";

// Hooks
import { useToast, showSuccess, showInfo } from "../utils/toast";
import { useSecurity } from "../hooks/useSecurity";
import { useGroupData } from "../hooks/useGroupData";
import { usePayment } from "../hooks/usePayment";

// Utils
import {
  calculateTotalSpent,
  calculatePerPersonShare,
  hasCompletedPayment,
  isUserCreditor,
  hasOutstandingDebts,
  getUserRole,
  canRemoveMember,
} from "../utils/groupUtils";

// Types and Constants
import { TabType } from "../types/group.types";
import { TABS } from "../constants/group.constants";

const GroupDetails: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { showError } = useToast();
  const { currentUserId } = useSecurity();

  // Custom hooks
  const { group, balances, settlements, loading, error, fetchGroupData } =
    useGroupData();

  const getCurrentUserId = useCallback(
    (): string => currentUserId || "",
    [currentUserId],
  );

  const {
    paymentModal,
    paymentMethod,
    transactionId,
    setPaymentMethod,
    setTransactionId,
    openPaymentModal,
    closePaymentModal,
    markAsPaid,
  } = usePayment(
    getCurrentUserId,
    useCallback(() => fetchGroupData(groupId!), [fetchGroupData, groupId]),
  );

  const [activeTab, setActiveTab] = React.useState<TabType>(TABS.EXPENSES);
  const [showAddMemberForm, setShowAddMemberForm] = React.useState(false);
  const [showAddExpenseForm, setShowAddExpenseForm] = React.useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = React.useState(false);
  const [memberEmail, setMemberEmail] = React.useState("");
  const [expenseData, setExpenseData] = React.useState({
    amount: "",
    description: "",
    category: "Food",
  });

  // Memoized calculations
  const { totalSpent, perPersonShare } = useMemo(
    () => ({
      totalSpent: calculateTotalSpent(group),
      perPersonShare: calculatePerPersonShare(group),
    }),
    [group],
  );

  // Effects
  useEffect(() => {
    if (groupId) {
      fetchGroupData(groupId);
    }
  }, [groupId, fetchGroupData]);

  // Event handlers
  const handlePayNow = useCallback(
    (balance: any) => {
      if (!groupId) return;
      openPaymentModal(balance, balances, groupId);
    },
    [groupId, openPaymentModal, balances],
  );

  const handleMarkAsPaid = useCallback(async () => {
    try {
      await markAsPaid(settlements);
    } catch (error) {
      console.error("Error in handleMarkAsPaid:", error);
    }
  }, [markAsPaid, settlements]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleBackToGroups = useCallback(() => {
    navigate("/groups");
  }, [navigate]);

  // Check if there's a paid settlement for this balance
  const checkCompletedPayment = useCallback(
    (balance: any) => {
      return hasCompletedPayment(balance, settlements);
    },
    [settlements],
  );

  const handleAddMember = useCallback(async () => {
    if (!groupId || !memberEmail.trim()) return;

    try {
      await axios.post(`/api/groups/${groupId}/members`, {
        email: memberEmail.trim(),
      });
      setShowAddMemberForm(false);
      setMemberEmail("");
      fetchGroupData(groupId);
    } catch (error: any) {
      showError(error.response?.data?.error || "Failed to add member");
    }
  }, [groupId, memberEmail, fetchGroupData, showError]);

  const handleRemoveMember = useCallback(
    async (memberId: string, memberName: string) => {
      if (!groupId) return;

      const confirmed = window.confirm(
        `Are you sure you want to remove ${memberName} from the group?`,
      );
      if (!confirmed) return;

      try {
        await axios.delete(`/api/groups/${groupId}/members/${memberId}`);
        fetchGroupData(groupId);
        showError(`${memberName} has been removed from the group`);
      } catch (error: any) {
        showError(error.response?.data?.error || "Failed to remove member");
      }
    },
    [groupId, fetchGroupData, showError],
  );

  const handleAddGroupExpense = async () => {
    if (!groupId || !group || !expenseData.amount || !expenseData.description)
      return;

    try {
      const amount = parseFloat(expenseData.amount);
      const splitAmount = amount / group.members.length;

      const splits = group.members.map((member) => ({
        userId: member.userId._id,
        amount: splitAmount,
      }));

      await axios.post(`/api/groups/${groupId}/expenses`, {
        amount: expenseData.amount,
        description: expenseData.description,
        category: expenseData.category,
        splits,
      });

      setShowAddExpenseForm(false);
      setExpenseData({ amount: "", description: "", category: "Food" });
      fetchGroupData(groupId);
    } catch (error: any) {
      showError(error.response?.data?.error || "Failed to add expense");
    }
  };

  // Memoized user role and status checks
  const currentUserRole = useMemo(
    () => getUserRole(getCurrentUserId(), group),
    [getCurrentUserId, group],
  );

  const isCurrentUserCreditor = useMemo(
    () => isUserCreditor(getCurrentUserId(), balances || []),
    [getCurrentUserId, balances],
  );

  const groupHasOutstandingDebts = useMemo(
    () => hasOutstandingDebts(balances || []),
    [balances],
  );

  const sendPaymentReminders = useCallback(async () => {
    if (!groupId) return;

    try {
      const response = await axios.post(
        `/api/settlements/group/${groupId}/send-reminders`,
      );
      const { remindersSent } = response.data;

      if (remindersSent > 0) {
        showSuccess(
          `Payment reminders sent to ${remindersSent} member${remindersSent > 1 ? "s" : ""}!`,
        );
      } else {
        showInfo("No payment reminders needed - all balances are settled!");
      }
    } catch (error: any) {
      showError(
        error.response?.data?.error || "Failed to send payment reminders",
      );
    }
  }, [groupId, showError, showSuccess, showInfo]);

  // Loading state
  if (loading || !group) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading group...</p>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        <div className="absolute top-20 left-4">
          <button
            onClick={handleBackToGroups}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium"
          >
            <span>←</span>
            <span>Back to Groups</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Simple Back Button */}
        <button
          onClick={handleBackToGroups}
          className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium"
        >
          <span>←</span>
          <span>Back to Groups</span>
        </button>

        {/* Group Header */}
        <GroupHeader
          group={group}
          totalSpent={totalSpent}
          perPersonShare={perPersonShare}
        />

        {/* Mobile-Responsive Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b overflow-x-auto scrollbar-hide">
            {Object.entries(TABS).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleTabChange(value)}
                className={`flex-shrink-0 px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap ${
                  activeTab === value
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="hidden sm:inline">
                  {value === TABS.EXPENSES && "Expenses"}
                  {value === TABS.BALANCES && "Balances"}
                  {value === TABS.SETTLEMENTS && "Payments"}
                </span>
                <span className="sm:hidden text-xs">
                  {value === TABS.EXPENSES && "💰 Expenses"}
                  {value === TABS.BALANCES && "⚖️ Balances"}
                  {value === TABS.SETTLEMENTS && "💳 Payments"}
                </span>
              </button>
            ))}
            <button
              onClick={() => setActiveTab("members")}
              className={`flex-shrink-0 px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap ${
                activeTab === "members"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="hidden sm:inline">
                Members ({group?.members.length || 0})
              </span>
              <span className="sm:hidden text-xs">
                👥 {group?.members.length || 0}
              </span>
            </button>
          </div>

          <div className="p-3 sm:p-6">
            {/* Mobile-Responsive Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
              {/* Show Scan Receipt and Add Expense only if group has members */}
              {group && group.members.length > 1 && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setShowReceiptScanner(!showReceiptScanner);
                      setShowAddExpenseForm(false);
                    }}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <span className="text-sm sm:text-base">📄</span>
                    <span>
                      {showReceiptScanner ? "Cancel Scan" : "Scan Receipt"}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddExpenseForm(!showAddExpenseForm);
                      setShowReceiptScanner(false);
                    }}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <span className="text-sm sm:text-base">➕</span>
                    <span>{showAddExpenseForm ? "Cancel" : "Add Expense"}</span>
                  </button>
                </div>
              )}

              {/* Add Member button - only for admins */}
              {currentUserRole === "admin" && (
                <button
                  onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <span className="text-sm sm:text-base">👥</span>
                  <span>{showAddMemberForm ? "Cancel" : "Add Member"}</span>
                </button>
              )}

              {/* Show hint when no other members */}
              {group &&
                group.members.length === 1 &&
                currentUserRole === "admin" && (
                  <div className="w-full text-xs text-blue-700 italic px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                    💡 Add members to unlock expense tracking and receipt
                    scanning
                  </div>
                )}

              {/* Show message for non-admins when no members */}
              {group &&
                group.members.length === 1 &&
                currentUserRole !== "admin" && (
                  <div className="w-full text-xs text-gray-600 italic px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    👑 Ask the group admin to add more members
                  </div>
                )}
              {activeTab === TABS.BALANCES && (
                <>
                  {isCurrentUserCreditor && groupHasOutstandingDebts ? (
                    <button
                      onClick={sendPaymentReminders}
                      className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2"
                      title="Send payment reminders to members who owe you money"
                    >
                      <span className="text-sm sm:text-base">💸</span>
                      <span>Send Reminders</span>
                    </button>
                  ) : (
                    !groupHasOutstandingDebts && (
                      <div className="w-10 text-xs text-gray-500 italic px-3 py-2 bg-gray-50 rounded-lg"></div>
                    )
                  )}
                </>
              )}
            </div>

            {/* Receipt Scanner */}
            {showReceiptScanner && (
              <div className="bg-white rounded-lg shadow border border-slate-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📄</span>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-900">
                      Scan Group Receipt
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Extract expense data from receipt
                    </p>
                  </div>
                </div>

                <ReceiptScanner
                  onReceiptScanned={(data) => {
                    setExpenseData({
                      amount: data.amount,
                      description: data.description,
                      category: data.category,
                    });
                    setShowReceiptScanner(false);
                    setShowAddExpenseForm(true);
                  }}
                  onFileSelected={() => {}}
                />
              </div>
            )}

            {/* Add Expense Form */}
            {showAddExpenseForm && group && (
              <AddExpenseForm
                group={group}
                expenseData={expenseData}
                onExpenseDataChange={setExpenseData}
                onSubmit={handleAddGroupExpense}
                onCancel={() => setShowAddExpenseForm(false)}
              />
            )}

            {/* Add Member Form - only for admins */}
            {showAddMemberForm && currentUserRole === "admin" && (
              <AddMemberForm
                memberEmail={memberEmail}
                onEmailChange={setMemberEmail}
                onSubmit={handleAddMember}
                onCancel={() => setShowAddMemberForm(false)}
              />
            )}

            {/* Expenses Tab */}
            {activeTab === TABS.EXPENSES && (
              <div className="space-y-4">
                {group.expenses.length > 0 ? (
                  group.expenses
                    .slice()
                    .reverse()
                    .map((expense) => (
                      <div
                        key={expense._id}
                        className="bg-white rounded-lg shadow border border-slate-200 p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-lg text-gray-900 mb-1 truncate">
                              {expense.description}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Paid by{" "}
                              <span className="font-medium">
                                {expense.userId?.name}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(expense.date), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                            <p className="text-2xl font-bold text-gray-900">
                              ${expense.amount.toFixed(2)}
                            </p>
                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full whitespace-nowrap">
                              {expense.category}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                              Split equally among {group.members.length} members
                            </p>
                            <p className="text-base font-semibold text-blue-600">
                              $
                              {(expense.amount / group.members.length).toFixed(
                                2,
                              )}{" "}
                              each
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-16">
                    <div className="text-8xl mb-4 opacity-50">📝</div>
                    <p className="text-gray-500 text-xl">No expenses yet</p>
                    <p className="text-gray-400">
                      Add an expense to get started
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Balances Tab */}
            {activeTab === TABS.BALANCES && (
              <div className="space-y-4">
                {balances.map((balance) => (
                  <div
                    key={balance.userId}
                    className="bg-white rounded-lg shadow border border-slate-200 p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm sm:text-lg text-gray-900 truncate">
                            {balance.userName}
                          </h3>
                          {balance.userId === getCurrentUserId() && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {balance.userEmail}
                        </p>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                        <p
                          className={`text-2xl font-bold ${
                            balance.status === "owed"
                              ? "text-blue-600"
                              : balance.status === "owes"
                                ? "text-rose-600"
                                : "text-gray-600"
                          }`}
                        >
                          {balance.status === "owed" && "+"}$
                          {Math.abs(balance.balance).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 whitespace-nowrap">
                          {balance.status === "owed" && "is owed"}
                          {balance.status === "owes" &&
                            (balance.userId === getCurrentUserId()
                              ? "you owe"
                              : "owes")}
                          {balance.status === "settled" && "settled up"}
                        </p>
                      </div>
                    </div>
                    {balance.userId === getCurrentUserId() && (
                      <>
                        {balance.status === "settled" ||
                        checkCompletedPayment(balance) ? (
                          <div className="mt-4 w-full bg-slate-100 border border-slate-300 text-slate-700 py-3 rounded-md font-medium text-center">
                            <span className="flex items-center justify-center gap-2">
                              <span className="text-lg">✅</span>
                              <span>Settled</span>
                            </span>
                          </div>
                        ) : balance.status === "owes" ? (
                          <button
                            onClick={() => handlePayNow(balance)}
                            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition-colors"
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
                ))}
                {balances.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-8xl mb-4 opacity-50">💰</div>
                    <p className="text-gray-500 text-xl">No balances to show</p>
                    <p className="text-gray-400">
                      Add expenses to see who owes what
                    </p>
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
                    className="bg-white rounded-lg shadow border border-slate-200 p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                            {settlement.fromUserId.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-lg">→</span>
                          </div>
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                            {settlement.toUserId.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <p className="font-semibold text-sm sm:text-lg text-gray-900 mb-1">
                          {settlement.fromUserId.name} →{" "}
                          {settlement.toUserId.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(
                            new Date(settlement.createdAt),
                            "MMM dd, yyyy • HH:mm",
                          )}
                        </p>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                        <p className="text-2xl font-bold text-gray-900">
                          ${settlement.amount.toFixed(2)}
                        </p>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            settlement.status === "paid"
                              ? "bg-slate-100 text-slate-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {settlement.status === "paid"
                            ? "✅ Completed"
                            : "⏳ Pending"}
                        </span>
                      </div>
                    </div>

                    {settlement.status === "paid" &&
                      settlement.paymentMethod && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <div className="bg-slate-50 rounded-lg p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                              <div>
                                <p className="text-gray-600 font-medium mb-1">
                                  Payment Method
                                </p>
                                <p className="text-gray-900 font-semibold">
                                  {settlement.paymentMethod}
                                </p>
                              </div>
                              {settlement.transactionId && (
                                <div>
                                  <p className="text-gray-600 font-medium mb-1">
                                    Transaction ID
                                  </p>
                                  <p className="text-gray-900 font-mono text-xs break-all">
                                    {settlement.transactionId}
                                  </p>
                                </div>
                              )}
                              {settlement.paidAt && (
                                <div>
                                  <p className="text-gray-600 font-medium mb-1">
                                    Paid On
                                  </p>
                                  <p className="text-gray-900 font-semibold">
                                    {format(
                                      new Date(settlement.paidAt),
                                      "MMM dd, yyyy",
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                ))}
                {settlements.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-lg flex items-center justify-center text-4xl opacity-50">
                      💳
                    </div>
                    <p className="text-gray-500 text-xl mb-2">
                      No payment history
                    </p>
                    <p className="text-gray-400">
                      Payments will appear here once made
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Members Tab */}
            {activeTab === "members" && (
              <div className="space-y-3 sm:space-y-4">
                {group?.members.map((member) => {
                  const isCurrentUser =
                    member.userId._id === getCurrentUserId();
                  const isAdmin = member.role === "admin";
                  const memberCanBeRemoved = canRemoveMember(member, group);

                  return (
                    <div
                      key={member.userId._id}
                      className="bg-white rounded-lg shadow border border-slate-200 p-3 sm:p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                          {/* Mobile-optimized avatar */}
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm sm:text-lg flex-shrink-0">
                            {member.userId.name.charAt(0).toUpperCase()}
                          </div>

                          {/* Member info - mobile responsive */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                              <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                                {member.userId.name}
                              </h3>
                              <div className="flex items-center gap-1 sm:gap-2">
                                {isCurrentUser && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap">
                                    You
                                  </span>
                                )}
                                {isAdmin && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full whitespace-nowrap">
                                    Admin
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Email - mobile responsive */}
                            <p className="text-xs sm:text-sm text-gray-600 truncate mb-1">
                              {member.userId.email}
                            </p>

                            {/* UPI ID - mobile responsive */}
                            {member.userId.upiId && (
                              <p className="text-xs text-gray-500 font-mono truncate">
                                UPI: {member.userId.upiId}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Remove button - mobile optimized */}
                        {currentUserRole === "admin" && memberCanBeRemoved && (
                          <button
                            onClick={() =>
                              handleRemoveMember(
                                member.userId._id,
                                member.userId.name,
                              )
                            }
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title={`Remove ${member.userId.name} from group`}
                          >
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add member hint when no members - mobile responsive */}
                {group?.members.length === 1 && (
                  <div className="text-center py-6 sm:py-8 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200">
                    <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">👥</div>
                    <p className="text-blue-800 font-medium mb-1 sm:mb-2 text-sm sm:text-base px-4">
                      Add members to start splitting expenses!
                    </p>
                    <p className="text-blue-600 text-xs sm:text-sm px-4">
                      Use the "Add Member" button above to invite people to your
                      group.
                    </p>
                  </div>
                )}

                {/* Admin info - mobile responsive */}
                {currentUserRole !== "admin" && group?.members.length > 1 && (
                  <div className="text-center py-3 sm:py-4 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-600">
                      👑 Only group admins can manage members
                    </p>
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
