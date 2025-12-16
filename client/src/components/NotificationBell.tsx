import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';
import { io, Socket } from 'socket.io-client';
import { notificationService } from '../utils/notificationService';

interface Notification {
  _id: string;
  type: 'budget_warning' | 'budget_exceeded' | 'budget_critical' | 'payment_reminder' | 'payment_request' | 'payment_received';
  title: string;
  message: string;
  category?: string;
  percentage?: number;
  groupId?: string;
  settlementId?: string;
  amount?: number;
  fromUser?: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showToast, setShowToast] = useState<Notification | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper function to format notification dates safely
  const formatNotificationDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Just now';
      }
      
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (error) {
      return 'Just now';
    }
  };

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.isRead).length, 
    [notifications]
  );

  useEffect(() => {
    if (user) {
      fetchNotifications();
      setupSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const setupSocket = () => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    
    newSocket.on('connect', () => {
      if (user) {
        newSocket.emit('join-user', user.id);
      }
    });

    newSocket.on('budget_notification', (notification: any) => {
      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);
      
      // Show native notification
      if (notification.type === 'budget_warning') {
        notificationService.showBudgetAlert(
          notification.category,
          parseFloat(notification.percentage),
          0, // Will be calculated from percentage
          'warning'
        );
      } else if (notification.type === 'budget_critical') {
        notificationService.showBudgetAlert(
          notification.category,
          parseFloat(notification.percentage),
          0,
          'critical'
        );
      } else if (notification.type === 'budget_exceeded') {
        notificationService.showBudgetAlert(
          notification.category,
          parseFloat(notification.percentage),
          0,
          'exceeded'
        );
      }
      
      // Show toast notification as fallback
      setShowToast(notification);
      setTimeout(() => setShowToast(null), 5000);
    });

    // Payment notification listeners
    newSocket.on('payment_reminder', (notification: any) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Show native notification
      notificationService.showPaymentReminder(
        notification.amount || 0,
        notification.creditorName || 'group member',
        notification.groupName || 'group',
        notification.groupId || ''
      );
      
      setShowToast(notification);
      setTimeout(() => setShowToast(null), 5000);
    });

    newSocket.on('payment_request', (notification: any) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Show native notification
      notificationService.showPaymentRequest(
        notification.amount || 0,
        notification.fromUser || 'Someone',
        notification.groupName || 'group',
        notification.groupId || ''
      );
      
      setShowToast(notification);
      setTimeout(() => setShowToast(null), 5000);
    });

    newSocket.on('payment_received', (notification: any) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Show native notification
      notificationService.showPaymentReceived(
        notification.amount || 0,
        notification.fromUser || 'Someone',
        notification.groupName || 'group',
        notification.groupId || ''
      );
      
      setShowToast(notification);
      setTimeout(() => setShowToast(null), 5000);
    });

    setSocket(newSocket);
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'budget_exceeded': return '🚨';
      case 'budget_critical': return '⚠️';
      case 'budget_warning': return '💡';
      case 'payment_reminder': return '💸';
      case 'payment_request': return '💰';
      case 'payment_received': return '✅';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'budget_exceeded': return 'text-red-700 bg-red-100 border-red-300';
      case 'budget_critical': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'budget_warning': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'payment_reminder': return 'text-red-700 bg-red-100 border-red-300';
      case 'payment_request': return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'payment_received': return 'text-green-700 bg-green-100 border-green-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  return (
    <>
      {/* Notification Bell - Mobile Optimized */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/20 hover:bg-white/30 transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H7a2 2 0 01-2-2V7a2 2 0 012-2h5m4 0v6m0 0v6m0-6h6m-6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown - Mobile Responsive */}
        {showDropdown && (
          <div className="fixed inset-x-4 top-24 sm:absolute sm:right-0 sm:left-auto sm:top-auto sm:mt-2 sm:w-96 sm:max-w-none bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 z-50 max-h-[70vh] sm:max-h-96 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs sm:text-sm text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>
            
            <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto scrollbar-hide bg-white">
              {notifications.length > 0 ? (
                notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                    className={`p-3 sm:p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <span className="text-lg sm:text-2xl flex-shrink-0">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-xs sm:text-sm text-gray-800 truncate">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full truncate ${getNotificationColor(notification.type)}`}>
                            {notification.category}
                          </span>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatNotificationDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 sm:p-8 text-center bg-white">
                  <div className="text-3xl sm:text-4xl mb-2 opacity-50">🔔</div>
                  <p className="text-gray-500 text-xs sm:text-sm">No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification - Mobile Responsive */}
      {showToast && (
        <div className="fixed top-16 sm:top-20 right-2 sm:right-4 left-2 sm:left-auto z-50 animate-slide-in-right">
          <div className={`bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm border-2 ${getNotificationColor(showToast.type)}`}>
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-lg sm:text-2xl flex-shrink-0">{getNotificationIcon(showToast.type)}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs sm:text-sm mb-1 text-gray-800 truncate">{showToast.title}</h4>
                <p className="text-xs text-gray-700 mb-2 line-clamp-2">{showToast.message}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-gray-600 truncate">{showToast.category}</span>
                  <button
                    onClick={() => setShowToast(null)}
                    className="text-xs text-gray-500 hover:text-gray-700 font-bold flex-shrink-0 p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </>
  );
};

export default NotificationBell;