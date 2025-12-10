import { Request, Response, NextFunction } from 'express';
import Group from '../models/Group';
import Expense from '../models/Expense';
import Income from '../models/Income';
import Budget from '../models/Budget';
import Settlement from '../models/Settlement';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

// Check if user is a member of the group
export const checkGroupMembership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = group.members.some(member => 
      member.userId.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You are not a member of this group.' });
    }

    next();
  } catch (error) {
    console.error('Group membership check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check if user is admin of the group
export const checkGroupAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const member = group.members.find(member => 
      member.userId.toString() === userId
    );

    if (!member || member.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    next();
  } catch (error) {
    console.error('Group admin check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check if user owns the expense
export const checkExpenseOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    if (expense.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only modify your own expenses.' });
    }

    next();
  } catch (error) {
    console.error('Expense ownership check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check if user owns the income
export const checkIncomeOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const income = await Income.findById(id);
    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }

    if (income.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only modify your own income records.' });
    }

    next();
  } catch (error) {
    console.error('Income ownership check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check if user owns the budget
export const checkBudgetOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const budget = await Budget.findById(id);
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    if (budget.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only modify your own budgets.' });
    }

    next();
  } catch (error) {
    console.error('Budget ownership check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check if user is involved in the settlement
export const checkSettlementAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const settlement = await Settlement.findById(id);
    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    const isInvolved = settlement.fromUserId.toString() === userId || 
                      settlement.toUserId.toString() === userId;

    if (!isInvolved) {
      return res.status(403).json({ error: 'Access denied. You are not involved in this settlement.' });
    }

    next();
  } catch (error) {
    console.error('Settlement access check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check if user can create settlement (must be the one who owes)
export const checkSettlementCreation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const { toUserId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify both users are in the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const fromUserInGroup = group.members.some(member => 
      member.userId.toString() === userId
    );
    const toUserInGroup = group.members.some(member => 
      member.userId.toString() === toUserId
    );

    if (!fromUserInGroup || !toUserInGroup) {
      return res.status(403).json({ error: 'Both users must be members of the group' });
    }

    // Prevent self-payment
    if (userId === toUserId) {
      return res.status(400).json({ error: 'Cannot create settlement to yourself' });
    }

    next();
  } catch (error) {
    console.error('Settlement creation check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check if user can verify payment (must be the receiver)
export const checkPaymentVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const settlement = await Settlement.findById(id);
    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    // Only the person receiving money can verify payment
    if (settlement.toUserId.toString() !== userId) {
      return res.status(403).json({ error: 'Only the payment recipient can verify the payment' });
    }

    if (settlement.status !== 'pending') {
      return res.status(400).json({ error: 'Settlement is not in pending status' });
    }

    next();
  } catch (error) {
    console.error('Payment verification check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check if user can mark payment as paid (must be the payer)
export const checkPaymentMarking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const settlement = await Settlement.findById(id);
    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    // Only the person paying can mark as paid
    if (settlement.fromUserId.toString() !== userId) {
      return res.status(403).json({ error: 'Only the payer can mark payment as paid' });
    }

    if (settlement.status !== 'pending') {
      return res.status(400).json({ error: 'Settlement is not in pending status' });
    }

    next();
  } catch (error) {
    console.error('Payment marking check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Prevent duplicate settlements
export const checkDuplicateSettlement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const { toUserId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check for existing pending settlement between these users
    const existingSettlement = await Settlement.findOne({
      groupId,
      fromUserId: userId,
      toUserId,
      status: 'pending'
    });

    if (existingSettlement) {
      return res.status(400).json({ 
        error: 'A pending settlement already exists between these users',
        settlementId: existingSettlement._id
      });
    }

    next();
  } catch (error) {
    console.error('Duplicate settlement check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};