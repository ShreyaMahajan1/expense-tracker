import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { 
  validateExpense, 
  validateObjectId, 
  validateFileUpload,
  handleValidationErrors 
} from '../middleware/validation';
import { checkExpenseOwnership } from '../middleware/authorization';
import multer from 'multer';
import Expense from '../models/Expense';
import ExpenseSplit from '../models/ExpenseSplit';
import { notificationService } from './notifications';

const router = Router();

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  }
});

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId })
      .sort({ date: -1 })
      .lean();
    
    const expenseIds = expenses.map(e => e._id);
    const splits = await ExpenseSplit.find({ expenseId: { $in: expenseIds } }).lean();
    
    const expensesWithSplits = expenses.map(expense => ({
      ...expense,
      splits: splits.filter(s => s.expenseId.toString() === expense._id.toString())
    }));
    
    res.json(expensesWithSplits);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

router.post('/', authenticate, upload.single('receipt'), async (req: AuthRequest, res) => {
  try {
    const { amount, description, category, date, paymentMethod, isRecurring, recurringDay, notes } = req.body;
    const receiptUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const expenseAmount = parseFloat(amount);

    const expense = await Expense.create({
      amount: expenseAmount,
      description,
      category,
      date: date ? new Date(date) : new Date(),
      receiptUrl,
      paymentMethod: paymentMethod || 'Cash',
      isRecurring: isRecurring === 'true' || isRecurring === true,
      recurringDay: recurringDay ? parseInt(recurringDay) : undefined,
      notes,
      userId: req.userId
    });

    // Check budget and send notification if needed
    if (notificationService && category) {
      await notificationService.checkBudgetAndNotify(req.userId!, category, expenseAmount);
    }

    res.json(expense);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create expense' });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { amount, description, category, date } = req.body;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { amount, description, category, date: new Date(date) },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update expense' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findOneAndDelete({ _id: id, userId: req.userId });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete expense' });
  }
});

export default router;
