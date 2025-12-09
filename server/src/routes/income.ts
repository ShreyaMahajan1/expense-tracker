import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import Income from '../models/Income';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const incomes = await Income.find({ userId: req.userId })
      .sort({ date: -1 })
      .lean();
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch income' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { amount, source, description, date } = req.body;

    const income = await Income.create({
      amount: parseFloat(amount),
      source,
      description,
      date: date ? new Date(date) : new Date(),
      userId: req.userId
    });

    res.json(income);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create income' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const income = await Income.findOneAndDelete({ _id: id, userId: req.userId });

    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }

    res.json({ message: 'Income deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete income' });
  }
});

export default router;
