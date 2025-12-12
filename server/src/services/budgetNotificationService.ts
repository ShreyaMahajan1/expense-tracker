import Budget from '../models/Budget';
import Expense from '../models/Expense';
import Notification from '../models/Notification';
import { Server } from 'socket.io';

interface BudgetCheckResult {
  shouldNotify: boolean;
  notificationType?: 'budget_warning' | 'budget_exceeded' | 'budget_critical';
  title?: string;
  message?: string;
  percentage?: number;
}

export class BudgetNotificationService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  // Payment reminder methods
  async sendPaymentReminder(
    userId: string, 
    groupId: string, 
    amount: number, 
    groupName: string,
    creditorName: string
  ): Promise<void> {
    try {
      const notification = await Notification.create({
        userId,
        type: 'payment_reminder',
        title: '💸 Payment Reminder',
        message: `You owe ₹${amount.toFixed(2)} to ${creditorName} in group "${groupName}". Please settle your payment.`,
        groupId,
        amount
      });

      // Send real-time notification with group details
      this.io.to(`user-${userId}`).emit('payment_reminder', {
        id: notification._id,
        type: 'payment_reminder',
        title: notification.title,
        message: notification.message,
        groupId,
        groupName,
        amount,
        creditorName,
        timestamp: notification.createdAt
      });

      console.log(`Payment reminder sent to user ${userId} for ₹${amount}`);
    } catch (error) {
      console.error('Error sending payment reminder:', error);
    }
  }

  async sendPaymentRequest(
    fromUserId: string,
    toUserId: string,
    groupId: string,
    settlementId: string,
    amount: number,
    groupName: string,
    requesterName: string
  ): Promise<void> {
    try {
      const notification = await Notification.create({
        userId: toUserId,
        type: 'payment_request',
        title: '💰 Payment Request',
        message: `${requesterName} has requested ₹${amount.toFixed(2)} from you in group "${groupName}".`,
        groupId,
        settlementId,
        amount,
        fromUserId,
        toUserId
      });

      // Send real-time notification
      this.io.to(`user-${toUserId}`).emit('payment_request', {
        id: notification._id,
        type: 'payment_request',
        title: notification.title,
        message: notification.message,
        groupId,
        groupName,
        settlementId,
        amount,
        fromUser: requesterName,
        timestamp: notification.createdAt
      });

      console.log(`Payment request sent from ${fromUserId} to ${toUserId} for ₹${amount}`);
    } catch (error) {
      console.error('Error sending payment request:', error);
    }
  }

  async sendPaymentReceived(
    userId: string,
    fromUserId: string,
    groupId: string,
    amount: number,
    groupName: string,
    payerName: string
  ): Promise<void> {
    try {
      const notification = await Notification.create({
        userId,
        type: 'payment_received',
        title: '✅ Payment Received',
        message: `You received ₹${amount.toFixed(2)} from ${payerName} in group "${groupName}".`,
        groupId,
        amount,
        fromUserId
      });

      // Send real-time notification
      this.io.to(`user-${userId}`).emit('payment_received', {
        id: notification._id,
        type: 'payment_received',
        title: notification.title,
        message: notification.message,
        groupId,
        groupName,
        amount,
        fromUser: payerName,
        timestamp: notification.createdAt
      });

      console.log(`Payment received notification sent to user ${userId} for ₹${amount}`);
    } catch (error) {
      console.error('Error sending payment received notification:', error);
    }
  }

  async checkAndSendPaymentReminders(groupId: string): Promise<void> {
    try {
      // This would be called periodically or when balances change
      // Implementation would check group balances and send reminders for outstanding debts
      console.log(`Checking payment reminders for group ${groupId}`);
    } catch (error) {
      console.error('Error checking payment reminders:', error);
    }
  }

  async checkBudgetAndNotify(userId: string, category: string, newExpenseAmount: number): Promise<void> {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Find budget for this category and month
      const budget = await Budget.findOne({
        userId,
        category,
        month: currentMonth,
        year: currentYear
      });

      if (!budget) {
        return; // No budget set for this category
      }

      // Calculate current spending including the new expense
      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0);

      const expenses = await Expense.find({
        userId,
        category,
        date: { $gte: startDate, $lte: endDate }
      });

      const currentSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0) + newExpenseAmount;
      const percentage = (currentSpent / budget.limit) * 100;

      const checkResult = this.determineBudgetStatus(currentSpent, budget.limit, percentage, category);

      if (checkResult.shouldNotify) {
        await this.createAndSendNotification(
          userId,
          checkResult.notificationType!,
          checkResult.title!,
          checkResult.message!,
          category,
          budget.limit,
          currentSpent,
          percentage
        );
      }
    } catch (error) {
      console.error('Error checking budget:', error);
    }
  }

  private determineBudgetStatus(spent: number, limit: number, percentage: number, category: string): BudgetCheckResult {
    if (percentage >= 100) {
      return {
        shouldNotify: true,
        notificationType: 'budget_exceeded',
        title: '🚨 Budget Exceeded!',
        message: `You've exceeded your ${category} budget by $${(spent - limit).toFixed(2)}. Consider reducing spending in this category.`,
        percentage
      };
    } else if (percentage >= 90) {
      return {
        shouldNotify: true,
        notificationType: 'budget_critical',
        title: '⚠️ Budget Almost Exceeded!',
        message: `You've used ${percentage.toFixed(1)}% of your ${category} budget. Only $${(limit - spent).toFixed(2)} remaining.`,
        percentage
      };
    } else if (percentage >= 75) {
      return {
        shouldNotify: true,
        notificationType: 'budget_warning',
        title: '💡 Budget Warning',
        message: `You've used ${percentage.toFixed(1)}% of your ${category} budget. $${(limit - spent).toFixed(2)} remaining.`,
        percentage
      };
    }

    return { shouldNotify: false };
  }

  private async createAndSendNotification(
    userId: string,
    type: 'budget_warning' | 'budget_exceeded' | 'budget_critical',
    title: string,
    message: string,
    category: string,
    budgetLimit: number,
    currentSpent: number,
    percentage: number
  ): Promise<void> {
    try {
      // Check if we already sent a similar notification recently (within last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const existingNotification = await Notification.findOne({
        userId,
        type,
        category,
        createdAt: { $gte: oneHourAgo }
      });

      if (existingNotification) {
        return; // Don't spam notifications
      }

      // Create notification
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        category,
        budgetLimit,
        currentSpent,
        percentage
      });

      // Send real-time notification via Socket.io
      this.io.to(`user-${userId}`).emit('budget_notification', {
        id: notification._id,
        type,
        title,
        message,
        category,
        percentage: percentage.toFixed(1),
        timestamp: notification.createdAt
      });

      console.log(`Budget notification sent to user ${userId}: ${title}`);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  async getNotifications(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }
}