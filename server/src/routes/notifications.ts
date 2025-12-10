import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { BudgetNotificationService } from '../services/budgetNotificationService';
import { Server } from 'socket.io';

const router = Router();

// This will be set when the router is initialized
let notificationService: BudgetNotificationService;

export const initializeNotificationRoutes = (io: Server) => {
  notificationService = new BudgetNotificationService(io);
  return router;
};

// Get user notifications
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { limit } = req.query;
    const notifications = await notificationService.getNotifications(
      req.userId!,
      limit ? parseInt(limit as string) : 20
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await notificationService.markAsRead(req.userId!, id);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticate, async (req: AuthRequest, res) => {
  try {
    await notificationService.markAllAsRead(req.userId!);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to mark all notifications as read' });
  }
});

export { notificationService };
export default router;