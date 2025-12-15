import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../utils/toast';
import { useScrollLock } from '../hooks/useScrollLock';
import axios from '../config/axios';

const UpiReminder: React.FC = () => {
  const [showReminder, setShowReminder] = useState(false);
  const [, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showInfo } = useToast();

  // Lock body scroll when modal is open
  useScrollLock(showReminder);

  useEffect(() => {
    const checkUpiSetup = async () => {
      if (!user) return;

      try {
        const response = await axios.get('/api/profile');
        setUserProfile(response.data);
        
        // Show reminder if UPI ID is not set
        if (!response.data.upiId) {
          // Check if user has dismissed reminder recently (within 24 hours)
          const lastDismissed = localStorage.getItem('upi-reminder-dismissed');
          const now = Date.now();
          const oneDayMs = 24 * 60 * 60 * 1000;
          
          if (!lastDismissed || (now - parseInt(lastDismissed)) > oneDayMs) {
            setShowReminder(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    checkUpiSetup();
  }, [user]);

  const handleSetupNow = () => {
    setShowReminder(false);
    navigate('/profile');
    showInfo('Set up your UPI ID to receive payments from group members!');
  };

  const handleDismiss = () => {
    setShowReminder(false);
    localStorage.setItem('upi-reminder-dismissed', Date.now().toString());
  };

  const handleRemindLater = () => {
    setShowReminder(false);
    // Set a shorter reminder (4 hours)
    const fourHoursMs = 4 * 60 * 60 * 1000;
    localStorage.setItem('upi-reminder-dismissed', (Date.now() - (24 * 60 * 60 * 1000) + fourHoursMs).toString());
  };

  if (!showReminder) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleDismiss}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-4 sm:p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10"></div>
        
        <div className="relative z-10">
          {/* Icon - Mobile Responsive */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl sm:text-3xl shadow-lg">
            💳
          </div>
          
          {/* Content - Mobile Responsive */}
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
              Set Up Your UPI ID
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              Add your UPI ID to receive payments from group members. This makes settling expenses quick and easy!
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-blue-50 rounded-2xl p-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-blue-800">
                <span className="text-lg">⚡</span>
                <span>Instant payments from group members</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-blue-800">
                <span className="text-lg">🔒</span>
                <span>Secure QR code generation</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-blue-800">
                <span className="text-lg">📱</span>
                <span>Works with all UPI apps</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleSetupNow}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base min-h-[44px]"
            >
              Set Up Now
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={handleRemindLater}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Remind Later
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpiReminder;