import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PAYMENT_METHODS } from '../constants/group.constants';
import { maskUpiId } from '../utils/upiUtils';
import { useScrollLock } from '../hooks/useScrollLock';

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
  
  // Lock body scroll when modal is open
  useScrollLock(isOpen);
  
  if (!isOpen) return null;

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(payeeUpiId);
    } catch (error) {
      console.error('Failed to copy UPI ID:', error);
    }
  };



  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-lg max-w-xs w-full h-auto max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-blue-600 rounded-t-2xl p-3 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-semibold text-white">
                Pay ₹{paymentAmount.toFixed(2)}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-lg w-6 h-6 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-2 overflow-y-auto flex-1 min-h-0 space-y-2">
          {/* Payee Info */}
          <div className="bg-gray-50 rounded-xl p-2">
            <p className="text-sm font-medium text-gray-700 text-center">
              To: <span className="font-semibold text-gray-900">{payeeName}</span>
            </p>
          </div>

          {/* UPI Payment Section */}
          <div className="border rounded-xl p-2">
            {upiLink && payeeUpiId ? (
              <>
                <div className="text-center mb-2">
                  <QRCodeSVG 
                    value={upiLink} 
                    size={90}
                    level="L"
                    includeMargin={true}
                    marginSize={1}
                  />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-2 mb-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">UPI ID</p>
                      <p className="font-mono text-xs text-gray-800 truncate">
                        {maskUpiId(payeeUpiId)}
                      </p>
                    </div>
                    <button
                      onClick={handleCopyUpiId}
                      className="px-2 py-1 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 flex-shrink-0"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 text-center">
                  Scan QR or use UPI ID
                </p>
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
                <p className="text-xs text-yellow-800">
                  ⚠️ No UPI ID set
                </p>
              </div>
            )}
          </div>

          {/* Payment Verification Form */}
          <div className="border rounded-xl p-2">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Verify Payment
            </h3>
            
            <div className="space-y-2">
              <select
                value={paymentMethod}
                onChange={(e) => onPaymentMethodChange(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg text-sm"
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
                className="w-full px-2 py-1.5 rounded-lg text-sm"
              />

              <div className="flex gap-2">
                <button
                  onClick={onMarkAsPaid}
                  className="flex-1 bg-green-600 text-white py-1.5 rounded-lg hover:bg-green-700 font-medium text-sm"
                >
                  Paid
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-300 text-gray-700 py-1.5 rounded-lg hover:bg-gray-400 text-sm"
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