import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
// Validation and authorization middleware removed for simplified approach
import Settlement from '../models/Settlement';
import Group from '../models/Group';
import Expense from '../models/Expense';
import ExpenseSplit from '../models/ExpenseSplit';
import User from '../models/User';

const router = Router();

// Debug endpoint to check expenses and splits
router.get('/group/:groupId/debug', authenticate, async (req: AuthRequest, res) => {
  try {
    const { groupId } = req.params;
    
    const expenses = await Expense.find({ groupId }).populate('userId', 'name email');
    const splits = await ExpenseSplit.find({
      expenseId: { $in: expenses.map(e => e._id) }
    }).populate('userId', 'name email');
    
    res.json({
      groupId,
      expenses: expenses.map(e => ({
        id: e._id,
        amount: e.amount,
        description: e.description,
        payer: (e.userId as any).name,
        payerId: (e.userId as any)._id
      })),
      splits: splits.map(s => ({
        id: s._id,
        expenseId: s.expenseId,
        amount: s.amount,
        user: (s.userId as any).name,
        userId: (s.userId as any)._id
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Debug failed' });
  }
});

// Calculate balances for a group
router.get('/group/:groupId/balances', authenticate, async (req: AuthRequest, res) => {
  try {
    const { groupId } = req.params;

    // Get all expenses for the group
    const expenses = await Expense.find({ groupId }).populate('userId', 'name email');
    const splits = await ExpenseSplit.find({
      expenseId: { $in: expenses.map(e => e._id) }
    }).populate('userId', 'name email');

    // Get user details first
    const group = await Group.findById(groupId).populate('members.userId', 'name email');
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }



    // Calculate who owes whom - Simple approach
    const balances: Record<string, number> = {};

    // Initialize balances for all group members
    group.members.forEach(member => {
      const userId = member.userId._id.toString();
      balances[userId] = 0;
    });

    // Add what each person paid
    expenses.forEach(expense => {
      const payerId = expense.userId._id.toString();
      if (balances.hasOwnProperty(payerId)) {
        balances[payerId] += expense.amount;
      }
    });

    // Subtract what each person owes
    splits.forEach(split => {
      const userId = split.userId._id.toString();
      if (balances.hasOwnProperty(userId)) {
        balances[userId] -= split.amount;
      }
    });

    // Get all paid settlements for this group and adjust balances
    const paidSettlements = await Settlement.find({
      groupId,
      status: 'paid'
    }).populate('fromUserId toUserId', 'name email');

    // Adjust balances based on paid settlements
    paidSettlements.forEach(settlement => {
      const fromUserId = settlement.fromUserId._id.toString();
      const toUserId = settlement.toUserId._id.toString();
      
      if (balances.hasOwnProperty(fromUserId) && balances.hasOwnProperty(toUserId)) {
        // The person who paid reduces their debt
        balances[fromUserId] += settlement.amount;
        // The person who received payment reduces what they're owed
        balances[toUserId] -= settlement.amount;
      }
    });

    const balanceDetails = Object.entries(balances).map(([userId, balance]) => {
      const member = group.members.find(m => m.userId._id.toString() === userId);
      
      // Check if this user has any paid settlements (either as payer or receiver)
      const userPaidSettlements = paidSettlements.filter(settlement => 
        settlement.fromUserId._id.toString() === userId || 
        settlement.toUserId._id.toString() === userId
      );
      
      // Calculate the rounded balance for precision
      const roundedBalance = Math.round(balance * 100) / 100;
      
      // Determine status based on balance and settlements
      let status: 'settled' | 'owed' | 'owes';
      
      if (Math.abs(roundedBalance) < 0.01) {
        // Balance is essentially zero
        status = 'settled';
      } else if (roundedBalance > 0.01) {
        // User is owed money
        status = 'owed';
      } else {
        // User owes money - but check if they have paid settlements that cover this
        const totalPaidByUser = userPaidSettlements
          .filter(s => s.fromUserId._id.toString() === userId)
          .reduce((sum, s) => sum + s.amount, 0);
        
        const totalOwedAmount = Math.abs(roundedBalance);
        
        
        // If user has paid settlements that cover or exceed what they owe, mark as settled
        if (totalPaidByUser >= totalOwedAmount) {
          status = 'settled';
        } else {
          status = 'owes';
        }
      }
      
      return {
        userId,
        userName: (member?.userId as any)?.name || 'Unknown User',
        userEmail: (member?.userId as any)?.email || 'No email',
        balance: roundedBalance,
        status,
        paidSettlements: userPaidSettlements.length // For debugging
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
    
    // Generate UPI payment link - preserve original case as entered by user
    const upiId = payee.upiId.trim(); // Keep exact case as entered by user
    const payeeName = (settlement.toUserId as any).name;
    const amount = settlement.amount.toFixed(2);
    const note = `Payment from ${(settlement.fromUserId as any).name || 'Group Member'}`;

    // Generate UPI payment link with domain-specific optimization
    const domain = upiId.split('@')[1]?.toLowerCase();
    
    // Use ultra-simple format for SBI domains, standard format for others
    const upiLink = (domain === 'oksbi' || domain === 'sbi') 
      ? `upi://pay?pa=${upiId}&am=${amount}`
      : `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

    res.json({
      upiLink,
      amount: parseFloat(amount),
      payeeName,
      payeeUpiId: upiId,
      settlementId: settlement._id
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to generate UPI link' });
  }
});

export default router;
