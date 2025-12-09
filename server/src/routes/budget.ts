import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import Budget from '../models/Budget';
import Expense from '../models/Expense';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

    const budgets = await Budget.find({
      userId: req.userId,
      month: currentMonth,
      year: currentYear
    }).lean();

    // Calculate spent amount for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = new Date(currentYear, currentMonth - 1, 1);
        const endDate = new Date(currentYear, currentMonth, 0);

        const expenses = await Expense.find({
          userId: req.userId,
          category: budget.category,
          date: { $gte: startDate, $lte: endDate }
        });

        const spent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const remaining = budget.limit - spent;
        const percentage = (spent / budget.limit) * 100;

        return {
          ...budget,
          spent,
          remaining,
          percentage: Math.min(percentage, 100)
        };
      })
    );

    res.json(budgetsWithSpent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { category, limit, month, year } = req.body;

    const budget = await Budget.findOneAndUpdate(
      {
        userId: req.userId,
        category,
        month: month || new Date().getMonth() + 1,
        year: year || new Date().getFullYear()
      },
      { limit: parseFloat(limit) },
      { upsert: true, new: true }
    );

    res.json(budget);
  } catch (error) {
    res.status(400).json({ error: 'Failed to set budget' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await Budget.findOneAndDelete({ _id: id, userId: req.userId });
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete budget' });
  }
});

export default router;
