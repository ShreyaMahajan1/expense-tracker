import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PAYMENT_METHODS } from '../constants/group.constants';
import { MODAL_CLASSES } from '../constants/ui.constants';
import { useScrollLock } from '../hooks/useScrollLock';
import { UpiAppHandler, UPI_APPS } from '../utils/upiAppHandler';

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
  
  const [isMobile, setIsMobile] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Lock body scroll when modal is open
  useScrollLock(isOpen);
  
  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  // Mask UPI ID for privacy (show only first 2 and last part after @)
  const maskUpiId = useCallback((upiId: string): string => {
    if (!upiId || upiId.length < 4) return upiId;
    
    const [localPart, domain] = upiId.split('@');
    if (!domain) return upiId;
    
    if (localPart.length <= 4) {
      return `${localPart.charAt(0)}${'x'.repeat(localPart.length - 1)}@${domain}`;
    }
    
    const maskedLocal = `${localPart.substring(0, 2)}${'x'.repeat(localPart.length - 4)}${localPart.substring(localPart.length - 2)}`;
    return `${maskedLocal}@${domain}`;
  }, []);

  const handleCopyUpiId = useCallback(async () => {
    const success = await UpiAppHandler.copyUpiId(payeeUpiId);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [payeeUpiId]);

  const handlePayWithUPI = useCallback(async () => {
    if (!payeeUpiId) return;

    const paymentData = {
      payeeUpiId,
      payeeName,
      amount: paymentAmount,
      note: `Payment to ${payeeName}`
    };

    const success = await UpiAppHandler.openUpiApp(paymentData);
    if (!success && isMobile) {
      UpiAppHandler.showUpiAppNotFoundMessage();
    }
  }, [payeeUpiId, payeeName, paymentAmount, isMobile]);
  
  if (!isOpen) return null;



  return (
    <div 
      className={MODAL_CLASSES.OVERLAY}
      onClick={onClose}
    >
      <div 
        className={MODAL_CLASSES.CONTAINER}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={MODAL_CLASSES.HEADER}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg sm:text-base font-semibold text-white">
                Pay ₹{paymentAmount.toFixed(2)}
              </h2>
              <p className="text-blue-100 text-sm sm:text-xs">to {payeeName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className={MODAL_CLASSES.CONTENT}>
          {/* UPI Payment Section */}
          <div className="border border-gray-200 rounded-lg p-3 sm:p-2">
            {upiLink && payeeUpiId ? (
              <>
                {/* Mobile-Only UPI Payment Button */}
                {isMobile && (
                  <div className="mb-3">
                    <button
                      onClick={handlePayWithUPI}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>📱</span>
                      <span>Pay with UPI App</span>
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      Opens your UPI app directly
                    </p>
                  </div>
                )}
                
                {/* QR Code Section - Desktop Only */}
                {!isMobile && (
                  <div className="text-center mb-3">
                    <div className="inline-block p-2 bg-white border border-gray-200 rounded-lg">
                      <QRCodeSVG 
                        value={upiLink} 
                        size={100}
                        level="M"
                        includeMargin={true}
                        marginSize={1}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Scan with any UPI app
                    </p>
                  </div>
                )}
                
                {/* UPI ID Section */}
                <div className="bg-gray-50 rounded-lg p-2 mb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">UPI ID</p>
                      <p className="font-mono text-xs text-gray-800 truncate">
                        {maskUpiId(payeeUpiId)}
                      </p>
                    </div>
                    <button
                      onClick={handleCopyUpiId}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        copySuccess 
                          ? 'bg-gray-600 text-white' 
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                      title="Copy full UPI ID"
                    >
                      {copySuccess ? '✓' : 'Copy'}
                    </button>
                  </div>
                </div>
                
                {/* Popular UPI Apps - Mobile Only - Simplified */}
                {isMobile && (
                  <div className="grid grid-cols-4 gap-1 mb-2">
                    {UPI_APPS.slice(0, 4).map((app) => (
                      <button
                        key={app.name}
                        onClick={handlePayWithUPI}
                        className="bg-gray-600 hover:bg-gray-700 text-white p-1.5 rounded text-xs font-medium flex flex-col items-center gap-0.5 transition-colors active:scale-95"
                      >
                        <span className="text-sm">{app.emoji}</span>
                        <span className="text-xs">{app.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                <span className="text-lg block mb-1">⚠️</span>
                <p className="text-sm text-gray-700 font-medium">
                  UPI ID not available
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Ask {payeeName} to set up their UPI ID
                </p>
              </div>
            )}
          </div>

          {/* Payment Verification Form */}
          <div className="border border-gray-200 rounded-lg p-3 sm:p-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
              <span>✅</span>
              <span>Confirm Payment</span>
            </h3>
            
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => onPaymentMethodChange(e.target.value)}
                  className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={PAYMENT_METHODS.UPI}>💳 {PAYMENT_METHODS.UPI}</option>
                  <option value={PAYMENT_METHODS.CASH}>💵 {PAYMENT_METHODS.CASH}</option>
                  <option value={PAYMENT_METHODS.BANK_TRANSFER}>🏦 {PAYMENT_METHODS.BANK_TRANSFER}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => onTransactionIdChange(e.target.value)}
                  placeholder="Enter transaction ID"
                  className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={onMarkAsPaid}
                  disabled={!transactionId.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded font-medium text-sm transition-colors"
                >
                  Mark as Paid
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded font-medium text-sm transition-colors"
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