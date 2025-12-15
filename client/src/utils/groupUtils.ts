// Group-related utility functions

import { Group, Balance } from '../types/group.types';

/**
 * Calculate total spent across all group expenses
 */
export const calculateTotalSpent = (group: Group | null): number => {
  if (!group) return 0;
  return group.expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

/**
 * Calculate per-person share of expenses
 */
export const calculatePerPersonShare = (group: Group | null): number => {
  if (!group || group.members.length === 0) return 0;
  const totalSpent = calculateTotalSpent(group);
  return totalSpent / group.members.length;
};

/**
 * Check if user has completed payment for a balance
 */
export const hasCompletedPayment = (balance: Balance, settlements: any[]): boolean => {
  // If the balance status is already 'settled', no need to show pay button
  if (balance.status === 'settled') {
    return true;
  }
  
  // Check if there are paid settlements from this user
  const userPaidSettlements = settlements.filter(settlement => 
    settlement.fromUserId._id === balance.userId && 
    settlement.status === 'paid'
  );
  
  if (userPaidSettlements.length === 0) {
    return false;
  }
  
  // Calculate total paid amount
  const totalPaid = userPaidSettlements.reduce((sum, settlement) => sum + settlement.amount, 0);
  const amountOwed = Math.abs(balance.balance);
  
  // If user has paid enough to cover their debt, consider it completed
  return totalPaid >= amountOwed;
};

/**
 * Check if current user is a creditor (owed money)
 */
export const isUserCreditor = (currentUserId: string, balances: Balance[]): boolean => {
  if (!currentUserId || !balances) return false;
  
  const userBalance = balances.find(b => b.userId === currentUserId);
  return userBalance?.status === 'owed' && userBalance.balance > 0.01;
};

/**
 * Check if there are outstanding debts in the group
 */
export const hasOutstandingDebts = (balances: Balance[]): boolean => {
  if (!balances) return false;
  return balances.some(b => b.status === 'owes' && b.balance < -0.01);
};

/**
 * Get user role in group
 */
export const getUserRole = (currentUserId: string, group: Group | null): string => {
  if (!currentUserId || !group) return 'member';
  
  const currentMember = group.members.find(m => m.userId._id === currentUserId);
  return currentMember?.role || 'member';
};

/**
 * Check if member can be removed (not admin or multiple admins exist)
 */
export const canRemoveMember = (member: any, group: Group | null): boolean => {
  if (!group) return false;
  
  const isAdmin = member.role === 'admin';
  const adminCount = group.members.filter(m => m.role === 'admin').length;
  
  return !isAdmin || adminCount > 1;
};