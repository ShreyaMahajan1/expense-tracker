import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';
import { io, Socket } from 'socket.io-client';

interface Notification {
  _id: string;
  type: 'budget_warning' | 'budget_exceeded' | 'budget_critical';
  title: string;
  message: string;
  category: string;
  percentage: number;
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
      
      // Show toast notification
      setShowToast(notification);
      setTimeout(() => setShowToast(null), 5000);
    });

    setSocket(newSocket);
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'budget_exceeded': return '🚨';
      case 'budget_critical': return '⚠️';
      case 'budget_warning': return '💡';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'budget_exceeded': return 'text-red-700 bg-red-100 border-red-300';
      case 'budget_critical': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'budget_warning': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      default: return 'text-blue-700 bg-blue-100 border-blue-300';
    }
  };

  return (
    <>
      {/* Notification Bell */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative p-2 rounded-2xl bg-white/20 hover:bg-white/30 transition-all duration-300"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H7a2 2 0 01-2-2V7a2 2 0 012-2h5m4 0v6m0 0v6m0-6h6m-6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto scrollbar-hide bg-white">
              {notifications.length > 0 ? (
                notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm text-gray-800">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full ${getNotificationColor(notification.type)}`}>
                            {notification.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-white">
                  <div className="text-4xl mb-2 opacity-50">🔔</div>
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
          <div className={`bg-white p-4 rounded-3xl shadow-2xl max-w-sm border-2 ${getNotificationColor(showToast.type)}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getNotificationIcon(showToast.type)}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm mb-1 text-gray-800">{showToast.title}</h4>
                <p className="text-xs text-gray-700 mb-2">{showToast.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">{showToast.category}</span>
                  <button
                    onClick={() => setShowToast(null)}
                    className="text-xs text-gray-500 hover:text-gray-700 font-bold"
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