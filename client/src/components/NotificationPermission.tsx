import React, { useState, useEffect } from 'react';
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

    // Show prompt if permission is default and not dismissed
    const isDismissed = localStorage.getItem('notification-permission-dismissed');
    if (currentPermission === 'default' && !isDismissed) {
      // Show after a short delay to not overwhelm user
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    }
  }, []);

  const handleEnableNotifications = async () => {
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
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('notification-permission-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Set reminder for 24 hours later
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    localStorage.setItem('notification-permission-dismissed', tomorrow.getTime().toString());
  };

  // Don't show if notifications aren't supported
  if (!notificationService.isSupported()) {
    return null;
  }

  // Don't show if already granted or denied
  if (permission === 'granted' || permission === 'denied' || !showPrompt || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 animate-slide-in">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🔔</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-2">
              Enable Notifications
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Get instant alerts for payment reminders, budget warnings, and group activities - even when the app is closed.
            </p>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={handleEnableNotifications}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl font-medium transition-colors"
              >
                Enable Notifications
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={handleRemindLater}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  Remind Later
                </button>
                <button
                  onClick={handleDismiss}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  No Thanks
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermission;