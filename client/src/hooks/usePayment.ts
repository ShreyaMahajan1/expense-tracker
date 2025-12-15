import { useState, useCallback } from 'react';
import axios from '../config/axios';
import { Balance } from '../types/group.types';
import { API_ENDPOINTS, PAYMENT_METHODS } from '../constants/group.constants';

interface PaymentModalState {
  isOpen: boolean;
  selectedBalance: Balance | null;
  payeeName: string;
  paymentAmount: number;
  upiLink: string;
  payeeUpiId: string;
  groupId: string;
}

interface UsePaymentReturn {
  paymentModal: PaymentModalState;
  paymentMethod: string;
  transactionId: string;
  setPaymentMethod: React.Dispatch<React.SetStateAction<string>>;
  setTransactionId: React.Dispatch<React.SetStateAction<string>>;
  openPaymentModal: (balance: Balance, balances: Balance[], groupId: string) => Promise<void>;
  closePaymentModal: () => void;
  markAsPaid: (settlements: any[]) => Promise<boolean>;
}

import { showSuccess, showError } from '../utils/toast';

export const usePayment = (
  getCurrentUserId: () => string,
  onPaymentSuccess: () => void
): UsePaymentReturn => {
  const [paymentModal, setPaymentModal] = useState<PaymentModalState>({
    isOpen: false,
    selectedBalance: null,
    payeeName: '',
    paymentAmount: 0,
    upiLink: '',
    payeeUpiId: '',
    groupId: '',
  });
  
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS.UPI);
  const [transactionId, setTransactionId] = useState('');

  const openPaymentModal = useCallback(async (
    balance: Balance, 
    balances: Balance[], 
    groupId: string
  ) => {
    // Security check
    if (balance.userId !== getCurrentUserId()) {
      showError('You can only pay your own debts');
      return;
    }

    // Find payee
    const payee = balances.find(b => b.balance > 0 && b.userId !== balance.userId);
    if (!payee) {
      showError('No one to pay in this group');
      return;
    }

    const amount = Math.abs(balance.balance);

    try {
      // Get payee's UPI ID directly without creating a settlement request
      const userRes = await axios.get(`/api/profile/upi/${payee.userId}`);
      const payeeUpiId = userRes.data.upiId;

      if (!payeeUpiId) {
        showError(`${payee.userName} hasn't set up their UPI ID yet. Ask them to add it in their profile.`);
        return;
      }

      // Generate UPI link directly
      const upiLink = `upi://pay?pa=${payeeUpiId}&pn=${encodeURIComponent(payee.userName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Payment from group: ${groupId}`)}`;

      setPaymentModal({
        isOpen: true,
        selectedBalance: balance,
        payeeName: payee.userName,
        paymentAmount: amount,
        upiLink: upiLink,
        payeeUpiId: payeeUpiId,
        groupId: groupId,
      });
    } catch (error: any) {
      console.error('Failed to prepare payment:', error);
      const errorMsg = error.response?.data?.error || 'Failed to prepare payment';
      showError(errorMsg);
    }
  }, [getCurrentUserId]);

  const closePaymentModal = useCallback(() => {
    setPaymentModal({
      isOpen: false,
      selectedBalance: null,
      payeeName: '',
      paymentAmount: 0,
      upiLink: '',
      payeeUpiId: '',
      groupId: '',
    });
    setTransactionId('');
  }, []);

  const markAsPaid = useCallback(async (settlements: any[]): Promise<boolean> => {
    if (!paymentModal.isOpen || !paymentModal.selectedBalance) {
      showError('No payment session found');
      return false;
    }

    if (!transactionId.trim()) {
      showError('Please enter the transaction ID from your UPI app');
      return false;
    }

    try {
      // Find the payee from balances
      const payee = settlements.length > 0 
        ? settlements.find(s => s.toUserId._id !== paymentModal.selectedBalance?.userId)?.toUserId
        : null;

      if (!payee) {
        // If no existing settlement, we need to find the payee from the group
        // For now, we'll create a direct payment record
        await axios.post(`${API_ENDPOINTS.SETTLEMENTS}/direct-payment`, {
          fromUserId: paymentModal.selectedBalance.userId,
          amount: paymentModal.paymentAmount,
          paymentMethod,
          transactionId: transactionId.trim(),
          groupId: paymentModal.groupId
        });

        closePaymentModal();
        onPaymentSuccess();
        showSuccess('✅ Payment recorded successfully! The payee will be notified.');
        return true;
      } else {
        // Check for existing pending settlement
        const pendingSettlement = settlements.find(
          s => s.fromUserId._id === paymentModal.selectedBalance?.userId && s.status === 'pending'
        );

        if (pendingSettlement) {
          await axios.post(`${API_ENDPOINTS.SETTLEMENTS}/${pendingSettlement._id}${API_ENDPOINTS.PAY}`, {
            paymentMethod,
            transactionId: transactionId.trim()
          });
        } else {
          // Create new settlement and mark as paid immediately
          const settlementRes = await axios.post(`${API_ENDPOINTS.SETTLEMENTS}${API_ENDPOINTS.REQUEST}`, {
            groupId: paymentModal.groupId,
            toUserId: payee._id,
            amount: paymentModal.paymentAmount
          });

          await axios.post(`${API_ENDPOINTS.SETTLEMENTS}/${settlementRes.data._id}${API_ENDPOINTS.PAY}`, {
            paymentMethod,
            transactionId: transactionId.trim()
          });
        }

        closePaymentModal();
        onPaymentSuccess();
        showSuccess('✅ Payment recorded successfully! The payee can verify the transaction ID.');
        return true;
      }
    } catch (error) {
      console.error('Failed to mark as paid:', error);
      showError('Failed to record payment');
      return false;
    }
  }, [paymentModal.isOpen, paymentModal.selectedBalance, transactionId, paymentMethod, closePaymentModal, onPaymentSuccess]);

  return {
    paymentModal,
    paymentMethod,
    transactionId,
    setPaymentMethod,
    setTransactionId,
    openPaymentModal,
    closePaymentModal,
    markAsPaid,
  };
};