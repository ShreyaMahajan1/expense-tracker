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
}

interface UsePaymentReturn {
  paymentModal: PaymentModalState;
  paymentMethod: string;
  transactionId: string;
  setPaymentMethod: (method: string) => void;
  setTransactionId: (id: string) => void;
  openPaymentModal: (balance: Balance, balances: Balance[], groupId: string) => Promise<void>;
  closePaymentModal: () => void;
  markAsPaid: (settlements: any[]) => Promise<boolean>;
}

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
  });
  
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.UPI);
  const [transactionId, setTransactionId] = useState('');

  const openPaymentModal = useCallback(async (
    balance: Balance, 
    balances: Balance[], 
    groupId: string
  ) => {
    // Security check
    if (balance.userId !== getCurrentUserId()) {
      alert('You can only pay your own debts');
      return;
    }

    // Find payee
    const payee = balances.find(b => b.balance > 0 && b.userId !== balance.userId);
    if (!payee) {
      alert('No one to pay in this group');
      return;
    }

    const amount = Math.abs(balance.balance);

    try {
      // Create settlement request
      const settlementRes = await axios.post(`${API_ENDPOINTS.SETTLEMENTS}${API_ENDPOINTS.REQUEST}`, {
        groupId,
        toUserId: payee.userId,
        amount
      });

      // Generate UPI link
      const upiRes = await axios.post(
        `${API_ENDPOINTS.SETTLEMENTS}/${settlementRes.data._id}${API_ENDPOINTS.UPI_LINK}`
      );

      setPaymentModal({
        isOpen: true,
        selectedBalance: balance,
        payeeName: payee.userName,
        paymentAmount: amount,
        upiLink: upiRes.data.upiLink,
        payeeUpiId: upiRes.data.payeeUpiId,
      });
    } catch (error: any) {
      console.error('Failed to create payment:', error);
      const errorMsg = error.response?.data?.error || 'Failed to create payment request';
      alert(errorMsg);
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
    });
    setTransactionId('');
  }, []);

  const markAsPaid = useCallback(async (settlements: any[]): Promise<boolean> => {
    if (!paymentModal.isOpen || !paymentModal.selectedBalance) {
      alert('No payment session found');
      return false;
    }

    if (!transactionId.trim()) {
      alert('Please enter the transaction ID from your UPI app');
      return false;
    }

    try {
      const pendingSettlement = settlements.find(
        s => s.fromUserId._id === paymentModal.selectedBalance?.userId && s.status === 'pending'
      );

      if (pendingSettlement) {
        await axios.post(`${API_ENDPOINTS.SETTLEMENTS}/${pendingSettlement._id}${API_ENDPOINTS.PAY}`, {
          paymentMethod,
          transactionId: transactionId.trim()
        });

        closePaymentModal();
        onPaymentSuccess();
        alert('✅ Payment recorded successfully! The payee can verify the transaction ID.');
        return true;
      } else {
        alert('No pending settlement found for this payment');
        return false;
      }
    } catch (error) {
      console.error('Failed to mark as paid:', error);
      alert('Failed to mark payment as paid');
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