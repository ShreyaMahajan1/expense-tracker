import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PAYMENT_METHODS } from '../constants/group.constants';

interface PaymentModalProps {
  isOpen: boolean;
  payeeName: string;
  paymentAmount: number;
  upiLink: string;
  payeeUpiId: string;
  paymentMethod: string;
  transactionId: string;
  onClose: () => void;
  onPaymentMethodChange: (method: string) => void;
  onTransactionIdChange: (id: string) => void;
  onMarkAsPaid: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  payeeName,
  paymentAmount,
  upiLink,
  payeeUpiId,
  paymentMethod,
  transactionId,
  onClose,
  onPaymentMethodChange,
  onTransactionIdChange,
  onMarkAsPaid,
}) => {
  if (!isOpen) return null;

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(payeeUpiId);
    } catch (error) {
      console.error('Failed to copy UPI ID:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[70vh]">
        {/* Header */}
        <div className="bg-white rounded-t-2xl p-2 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-gray-800">
                Pay ${paymentAmount.toFixed(2)}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-300"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-2">
          {/* Payee Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
            <p className="text-sm font-semibold text-blue-800 text-center">You owe: {payeeName}</p>
          </div>

          {/* UPI Payment Section */}
          <div className="bg-white border border-blue-200 rounded-lg p-2 mb-3">
            {upiLink && payeeUpiId ? (
              <>
                <div className="flex justify-center mb-2">
                  <QRCodeSVG value={upiLink} size={80} />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-2 mb-2">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs text-blue-700 font-bold break-all flex-1">
                      {payeeUpiId}
                    </p>
                    <button
                      onClick={handleCopyUpiId}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <p className="text-xs text-gray-700 text-center">
                  Scan QR or pay to UPI ID
                </p>
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
                <span className="text-lg block">⚠️</span>
                <p className="text-xs text-yellow-800 font-medium">
                  Payee hasn't set up UPI ID yet.
                </p>
              </div>
            )}
          </div>

          {/* Payment Verification Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-2">
            <p className="text-xs font-bold text-gray-800 mb-2 text-center">
              ✅ Verify Payment
            </p>
            
            <div className="space-y-2">
              <select
                value={paymentMethod}
                onChange={(e) => onPaymentMethodChange(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs"
              >
                <option value={PAYMENT_METHODS.UPI}>{PAYMENT_METHODS.UPI}</option>
                <option value={PAYMENT_METHODS.CASH}>{PAYMENT_METHODS.CASH}</option>
                <option value={PAYMENT_METHODS.BANK_TRANSFER}>{PAYMENT_METHODS.BANK_TRANSFER}</option>
              </select>

              <input
                type="text"
                value={transactionId}
                onChange={(e) => onTransactionIdChange(e.target.value)}
                placeholder="Transaction ID"
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs"
              />

              <div className="flex gap-2">
                <button
                  onClick={onMarkAsPaid}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-semibold text-xs"
                >
                  ✅ Verify
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-all duration-300 text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;