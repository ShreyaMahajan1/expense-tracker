import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import Expense from '../models/Expense';
import Income from '../models/Income';

const router = Router();

router.get('/summary', authenticate, async (req: AuthRequest, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    // Current month expenses (including group expenses)
    const expenses = await Expense.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate }
    });

    // Current month income
    const incomes = await Income.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate }
    });

    // Previous month for comparison
    const prevStartDate = new Date(currentYear, currentMonth - 2, 1);
    const prevEndDate = new Date(currentYear, currentMonth - 1, 0);

    const prevExpenses = await Expense.find({
      userId: req.userId,
      date: { $gte: prevStartDate, $lte: prevEndDate }
    });

    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const prevTotalExpense = prevExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Category breakdown
    const categoryBreakdown = expenses.reduce((acc: any, exp) => {
      if (!acc[exp.category]) {
        acc[exp.category] = 0;
      }
      acc[exp.category] += exp.amount;
      return acc;
    }, {});

    // Payment method breakdown
    const paymentMethodBreakdown = expenses.reduce((acc: any, exp) => {
      if (!acc[exp.paymentMethod]) {
        acc[exp.paymentMethod] = 0;
      }
      acc[exp.paymentMethod] += exp.amount;
      return acc;
    }, {});

    // Daily spending trend
    const dailySpending = expenses.reduce((acc: any, exp) => {
      const day = new Date(exp.date).getDate();
      if (!acc[day]) {
        acc[day] = 0;
      }
      acc[day] += exp.amount;
      return acc;
    }, {});

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      prevMonthExpense: prevTotalExpense,
      changePercent: prevTotalExpense > 0 
        ? ((totalExpense - prevTotalExpense) / prevTotalExpense) * 100 
        : 0,
      categoryBreakdown,
      paymentMethodBreakdown,
      dailySpending,
      expenseCount: expenses.length,
      incomeCount: incomes.length
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
