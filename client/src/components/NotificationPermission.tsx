import React, { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../utils/notificationService';

const NotificationPermission: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if (!notificationService.isSupported()) {
      return;
    }

    // Check current permission status
    const currentPermission = notificationService.getPermissionStatus();
    setPermission(currentPermission);

    // Check if user has dismissed the prompt
    const dismissedValue = localStorage.getItem('notification-permission-dismissed');
    let shouldShow = true;

    if (dismissedValue) {
      if (dismissedValue === 'true') {
        // Permanently dismissed
        shouldShow = false;
      } else {
        // Check if reminder time has passed
        const reminderTime = parseInt(dismissedValue);
        if (!isNaN(reminderTime) && Date.now() < reminderTime) {
          shouldShow = false;
        } else if (!isNaN(reminderTime)) {
          // Reminder time has passed, clear the localStorage
          localStorage.removeItem('notification-permission-dismissed');
        }
      }
    }

    // Show prompt if permission is default and should show
    if (currentPermission === 'default' && shouldShow) {
      // Show after a short delay to not overwhelm user
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    }
  }, []);

  const handleEnableNotifications = useCallback(async () => {
    const granted = await notificationService.requestPermission();
    setPermission(granted ? 'granted' : 'denied');
    setShowPrompt(false);

    if (granted) {
      // Show a test notification
      await notificationService.showNotification(
        '🎉 Notifications Enabled!',
        {
          body: 'You\'ll now receive payment reminders and budget alerts.',
          requireInteraction: false
        }
      );
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('notification-permission-dismissed', 'true');
  }, []);

  const handleRemindLater = useCallback(() => {
    setShowPrompt(false);
    // Set reminder for 24 hours later
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    localStorage.setItem('notification-permission-dismissed', tomorrow.getTime().toString());
  }, []);

  // Don't show if notifications aren't supported
  if (!notificationService.isSupported()) {
    return null;
  }

  // Don't show if already granted or denied
  if (permission === 'granted' || permission === 'denied' || !showPrompt || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 sm:top-4 right-4 sm:right-4 left-4 sm:left-auto z-50 max-w-sm">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 p-4 sm:p-6 animate-slide-in">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-lg sm:text-2xl">🔔</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2">
              Enable Notifications
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Get instant alerts for payment reminders, budget warnings, and group activities - even when the app is closed.
            </p>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={handleEnableNotifications}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium text-sm transition-colors min-h-[44px] flex items-center justify-center"
              >
                Enable Notifications
              </button>
              
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handleRemindLater}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 sm:py-2 px-3 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[44px] sm:min-h-[40px] flex items-center justify-center"
                >
                  Remind Later
                </button>
                <button
                  onClick={handleDismiss}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 sm:py-2 px-3 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[44px] sm:min-h-[40px] flex items-center justify-center"
                >
                  No Thanks
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermission;