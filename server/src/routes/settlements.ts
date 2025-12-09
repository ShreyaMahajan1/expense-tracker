import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import Settlement from '../models/Settlement';
import Group from '../models/Group';
import Expense from '../models/Expense';
import ExpenseSplit from '../models/ExpenseSplit';
import User from '../models/User';

const router = Router();

// Calculate balances for a group
router.get('/group/:groupId/balances', authenticate, async (req: AuthRequest, res) => {
  try {
    const { groupId } = req.params;

    // Get all expenses for the group
    const expenses = await Expense.find({ groupId }).populate('userId', 'name email');
    const splits = await ExpenseSplit.find({
      expenseId: { $in: expenses.map(e => e._id) }
    }).populate('userId', 'name email');

    // Calculate who owes whom
    const balances: Record<string, number> = {};

    // Initialize balances
    expenses.forEach(expense => {
      const payerId = expense.userId._id.toString();
      if (!balances[payerId]) balances[payerId] = 0;
    });

    // Add what each person paid
    expenses.forEach(expense => {
      const payerId = expense.userId._id.toString();
      balances[payerId] += expense.amount;
    });

    // Subtract what each person owes
    splits.forEach(split => {
      const userId = split.userId._id.toString();
      if (!balances[userId]) balances[userId] = 0;
      balances[userId] -= split.amount;
    });

    // Get user details
    const group = await Group.findById(groupId).populate('members.userId', 'name email');
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const balanceDetails = Object.entries(balances).map(([userId, balance]) => {
      const member = group.members.find(m => m.userId._id.toString() === userId);
      return {
        userId,
        userName: member?.userId.name || 'Unknown',
        userEmail: member?.userId.email || '',
        balance: balance,
        status: balance > 0 ? 'owed' : balance < 0 ? 'owes' : 'settled'
      };
    });

    res.json(balanceDetails);
  } catch (error) {
    console.error('Balance calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate balances' });
  }
});

// Create settlement request
router.post('/request', authenticate, async (req: AuthRequest, res) => {
  try {
    const { groupId, toUserId, amount } = req.body;

    const settlement = await Settlement.create({
      groupId,
      fromUserId: req.userId,
      toUserId,
      amount: parseFloat(amount),
      status: 'pending'
    });

    const populatedSettlement = await Settlement.findById(settlement._id)
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email');

    res.json(populatedSettlement);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create settlement request' });
  }
});

// Get settlements for a group
router.get('/group/:groupId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { groupId } = req.params;

    const settlements = await Settlement.find({ groupId })
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email')
      .sort({ createdAt: -1 });

    res.json(settlements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settlements' });
  }
});

// Mark settlement as paid
router.post('/:id/pay', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, transactionId } = req.body;

    const settlement = await Settlement.findById(id);
    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    // Verify the user is the one who owes
    if (settlement.fromUserId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    settlement.status = 'paid';
    settlement.paymentMethod = paymentMethod;
    settlement.transactionId = transactionId;
    settlement.paidAt = new Date();
    await settlement.save();

    const populatedSettlement = await Settlement.findById(settlement._id)
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email');

    res.json(populatedSettlement);
  } catch (error) {
    res.status(400).json({ error: 'Failed to mark as paid' });
  }
});

// Generate UPI payment link
router.post('/:id/upi-link', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const settlement = await Settlement.findById(id)
      .populate('toUserId', 'name email');

    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    // Get payee UPI ID from user profile
    const payee = await User.findById(settlement.toUserId);
    
    if (!payee || !payee.upiId) {
      return res.status(400).json({ 
        error: 'Payee has not set up their UPI ID. Please ask them to add it in their profile settings.' 
      });
    }
    
    // Generate UPI payment link
    // Format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE
    const upiId = payee.upiId;
    const payeeName = settlement.toUserId.name;
    const amount = settlement.amount;
    const note = `Settlement for group expense`;

    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    
    // Also generate QR code data
    const qrData = upiLink;

    res.json({
      upiLink,
      qrData,
      amount,
      payeeName,
      payeeUpiId: upiId,
      settlementId: settlement._id
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to generate UPI link' });
  }
});

export default router;
