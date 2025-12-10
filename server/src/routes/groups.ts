import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import Group from '../models/Group';
import User from '../models/User';
import Expense from '../models/Expense';
import ExpenseSplit from '../models/ExpenseSplit';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const groups = await Group.find({ 'members.userId': req.userId })
      .populate('members.userId', 'name email upiId phoneNumber')
      .lean();

    const groupsWithExpenses = await Promise.all(
      groups.map(async (group) => {
        const expenses = await Expense.find({ groupId: group._id })
          .populate('userId', 'name email')
          .sort({ date: -1 })
          .lean();
        return { ...group, expenses };
      })
    );

    res.json(groupsWithExpenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, description } = req.body;

    const group = await Group.create({
      name,
      description,
      members: [{ userId: req.userId, role: 'admin' }]
    });

    res.json(group);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create group' });
  }
});

router.post('/:id/members', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    // Check if user is already a member
    const existingGroup = await Group.findById(id);
    if (!existingGroup) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const alreadyMember = existingGroup.members.some(
      m => m.userId.toString() === user._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ error: 'User is already a member of this group' });
    }

    const group = await Group.findByIdAndUpdate(
      id,
      { $push: { members: { userId: user._id, role: 'member' } } },
      { new: true }
    ).populate('members.userId', 'name email');

    res.json(group);
  } catch (error: any) {
    console.error('Add member error:', error);
    res.status(400).json({ error: error.message || 'Failed to add member' });
  }
});

router.post('/:id/expenses', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { amount, description, category, splits } = req.body;

    console.log('Creating group expense:', { amount, description, category, groupId: id });

    // Get group to find all members
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const expense = await Expense.create({
      amount: parseFloat(amount),
      description,
      category,
      userId: req.userId,
      groupId: id
    });

    console.log('Created expense:', expense._id);

    // Create splits - either use provided splits or create equal splits for all members
    let splitsToCreate = [];
    
    if (splits && splits.length > 0) {
      splitsToCreate = splits.map((split: any) => ({
        expenseId: expense._id,
        userId: split.userId,
        amount: parseFloat(split.amount)
      }));
    } else {
      // Create equal splits for all group members
      const splitAmount = parseFloat(amount) / group.members.length;
      splitsToCreate = group.members.map(member => ({
        expenseId: expense._id,
        userId: member.userId,
        amount: splitAmount
      }));
    }

    console.log('Creating splits:', splitsToCreate);

    await ExpenseSplit.insertMany(splitsToCreate);

    const io = req.app.get('io');
    io.to(`group-${id}`).emit('new-expense', expense);

    res.json(expense);
  } catch (error) {
    console.error('Failed to create group expense:', error);
    res.status(400).json({ error: 'Failed to create group expense' });
  }
});

export default router;
