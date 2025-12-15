import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import User from '../models/User';

const router = Router();

// Get user profile
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, upiId, phoneNumber } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, upiId, phoneNumber },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update profile' });
  }
});

// Get user UPI ID for payment purposes (public endpoint for group members)
router.get('/upi/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('name upiId');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      name: user.name,
      upiId: user.upiId || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user UPI details' });
  }
});

export default router;
