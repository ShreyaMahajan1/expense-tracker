// Web Notifications API Service
export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.checkPermission();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private checkPermission(): void {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  public async showNotification(
    title: string,
    options: {
      body?: string;
      icon?: string;
      badge?: string;
      tag?: string;
      data?: any;
      requireInteraction?: boolean;
      silent?: boolean;
    } = {}
  ): Promise<void> {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return;
    }

    // Check permission
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn('Notification permission denied');
        return;
      }
    }

    try {
      // Default options
      const defaultOptions = {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: false,
        silent: false,
        ...options
      };

      const notification = new Notification(title, defaultOptions);

      // Auto-close after 5 seconds if not requiring interaction
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      // Handle click events
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Handle specific actions based on notification data
        if (options.data?.groupId) {
          window.location.href = `/groups/${options.data.groupId}`;
        }
      };

      // Handle errors
      notification.onerror = (error) => {
        console.error('Notification error:', error);
      };

    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  // Specific notification types
  public async showPaymentReminder(
    amount: number,
    creditorName: string,
    groupName: string,
    groupId: string
  ): Promise<void> {
    await this.showNotification(
      '💸 Payment Reminder',
      {
        body: `You owe ₹${amount.toFixed(2)} to ${creditorName} in "${groupName}"`,
        icon: '/favicon.ico',
        tag: `payment-reminder-${groupId}`,
        requireInteraction: true,
        data: { type: 'payment_reminder', groupId, amount, creditorName }
      }
    );
  }

  public async showPaymentRequest(
    amount: number,
    requesterName: string,
    groupName: string,
    groupId: string
  ): Promise<void> {
    await this.showNotification(
      '💰 Payment Request',
      {
        body: `${requesterName} requested ₹${amount.toFixed(2)} from you in "${groupName}"`,
        icon: '/favicon.ico',
        tag: `payment-request-${groupId}`,
        requireInteraction: true,
        data: { type: 'payment_request', groupId, amount, requesterName }
      }
    );
  }

  public async showPaymentReceived(
    amount: number,
    payerName: string,
    groupName: string,
    groupId: string
  ): Promise<void> {
    await this.showNotification(
      '✅ Payment Received',
      {
        body: `You received ₹${amount.toFixed(2)} from ${payerName} in "${groupName}"`,
        icon: '/favicon.ico',
        tag: `payment-received-${groupId}`,
        requireInteraction: false,
        data: { type: 'payment_received', groupId, amount, payerName }
      }
    );
  }

  public async showBudgetAlert(
    category: string,
    percentage: number,
    remaining: number,
    type: 'warning' | 'critical' | 'exceeded'
  ): Promise<void> {
    const icons = {
      warning: '💡',
      critical: '⚠️',
      exceeded: '🚨'
    };

    const titles = {
      warning: 'Budget Warning',
      critical: 'Budget Almost Exceeded',
      exceeded: 'Budget Exceeded!'
    };

    const bodies = {
      warning: `${category} budget: ${percentage.toFixed(1)}% used. ₹${remaining.toFixed(2)} remaining.`,
      critical: `${category} budget: ${percentage.toFixed(1)}% used. Only ₹${remaining.toFixed(2)} left!`,
      exceeded: `${category} budget exceeded by ₹${Math.abs(remaining).toFixed(2)}!`
    };

    await this.showNotification(
      `${icons[type]} ${titles[type]}`,
      {
        body: bodies[type],
        icon: '/favicon.ico',
        tag: `budget-${type}-${category}`,
        requireInteraction: type === 'exceeded',
        data: { type: `budget_${type}`, category, percentage, remaining }
      }
    );
  }

  public getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  public isSupported(): boolean {
    return 'Notification' in window;
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();