import React, { useState, useEffect } from 'react';
import { notificationService } from '../utils/notificationService';

const NotificationSettings: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(notificationService.isSupported());
    setPermission(notificationService.getPermissionStatus());
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await notificationService.requestPermission();
    setPermission(granted ? 'granted' : 'denied');
    
    if (granted) {
      // Show test notification
      await notificationService.showNotification(
        '🎉 Notifications Enabled!',
        {
          body: 'You\'ll now receive payment reminders and budget alerts.',
          requireInteraction: false
        }
      );
    }
  };



  if (!isSupported) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">📱 Browser Notifications</h3>
        <p className="text-sm text-gray-600">
          Your browser doesn't support notifications. Please use a modern browser like Chrome, Firefox, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 className="font-medium text-gray-900 mb-3">📱 Browser Notifications</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Notification Status</p>
            <p className="text-xs text-gray-500">
              {permission === 'granted' && '✅ Enabled - You\'ll receive native notifications'}
              {permission === 'denied' && '❌ Blocked - Enable in browser settings'}
              {permission === 'default' && '⏳ Not set - Click to enable'}
            </p>
          </div>
          
          <div className="flex gap-2">

            
            {permission !== 'granted' && (
              <button
                onClick={handleEnableNotifications}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Enable
              </button>
            )}
          </div>
        </div>

        {permission === 'denied' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800 font-medium mb-1">🔧 How to enable notifications:</p>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• <strong>Chrome:</strong> Click the 🔒 icon → Site settings → Notifications → Allow</li>
              <li>• <strong>Firefox:</strong> Click the shield icon → Permissions → Notifications → Allow</li>
              <li>• <strong>Safari:</strong> Safari menu → Preferences → Websites → Notifications → Allow</li>
            </ul>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800 font-medium mb-1">💡 You'll receive notifications for:</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• 💸 Payment reminders when you owe money</li>
            <li>• 💰 Payment requests from group members</li>
            <li>• ✅ Payment confirmations when you receive money</li>
            <li>• 🚨 Budget alerts when you exceed spending limits</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;