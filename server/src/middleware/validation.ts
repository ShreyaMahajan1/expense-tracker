import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Custom validation middleware to handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg,
        value: err.type === 'field' ? err.value : undefined
      }))
    });
  }
  next();
};

// MongoDB ObjectId validation
export const validateObjectId = (fieldName: string) => {
  return param(fieldName).custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error(`Invalid ${fieldName} format`);
    }
    return true;
  });
};

// User registration validation
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 100 })
    .withMessage('Email must not exceed 100 characters'),
  
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  handleValidationErrors
];

// User login validation
export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Expense validation
export const validateExpense = [
  body('amount')
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('Amount must be between $0.01 and $999,999.99'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Description must be between 1 and 200 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,!?()]+$/)
    .withMessage('Description contains invalid characters'),
  
  body('category')
    .isIn(['Food', 'Travel', 'Rent', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other'])
    .withMessage('Invalid category selected'),
  
  body('paymentMethod')
    .isIn(['Cash', 'UPI', 'Card', 'Net Banking', 'Wallet'])
    .withMessage('Invalid payment method selected'),
  
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  
  handleValidationErrors
];

// Income validation
export const validateIncome = [
  body('amount')
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('Amount must be between $0.01 and $999,999.99'),
  
  body('source')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Source must be between 1 and 100 characters'),
  
  body('category')
    .isIn(['Salary', 'Freelance', 'Investment', 'Gift', 'Other'])
    .withMessage('Invalid income category selected'),
  
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  handleValidationErrors
];

// Budget validation
export const validateBudget = [
  body('category')
    .isIn(['Food', 'Travel', 'Rent', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other'])
    .withMessage('Invalid category selected'),
  
  body('limit')
    .isFloat({ min: 1, max: 999999.99 })
    .withMessage('Budget limit must be between $1 and $999,999.99'),
  
  body('period')
    .isIn(['monthly', 'weekly', 'yearly'])
    .withMessage('Invalid budget period'),
  
  handleValidationErrors
];

// Group validation
export const validateGroup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Group name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Group name contains invalid characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),
  
  handleValidationErrors
];

// Group member validation
export const validateGroupMember = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

// Settlement validation
export const validateSettlement = [
  body('toUserId')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid recipient user ID');
      }
      return true;
    }),
  
  body('amount')
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('Settlement amount must be between $0.01 and $999,999.99'),
  
  handleValidationErrors
];

// Payment verification validation
export const validatePaymentVerification = [
  body('paymentMethod')
    .isIn(['UPI', 'Cash', 'Bank Transfer', 'Card'])
    .withMessage('Invalid payment method'),
  
  body('transactionId')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Transaction ID must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9\-_]+$/)
    .withMessage('Transaction ID contains invalid characters'),
  
  handleValidationErrors
];

// Profile update validation
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('phoneNumber')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('upiId')
    .optional()
    .matches(/^[\w.-]+@[\w.-]+$/)
    .withMessage('Please provide a valid UPI ID (e.g., user@paytm)')
    .isLength({ max: 50 })
    .withMessage('UPI ID must not exceed 50 characters'),
  
  handleValidationErrors
];

// File upload validation
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next();
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
    });
  }

  if (req.file.size > maxSize) {
    return res.status(400).json({
      error: 'File too large. Maximum size is 5MB.'
    });
  }

  next();
};

// Rate limiting validation
export const validateRateLimit = (req: Request, res: Response, next: NextFunction) => {
  // Additional rate limiting logic can be added here
  // This is already handled by express-rate-limit in index.ts
  next();
};

// CSRF token validation (for production)
export const validateCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production') {
    const token = req.headers['x-csrf-token'] as string;
    // Note: Session-based CSRF is disabled for now as we're using JWT
    // const sessionToken = (req as any).session?.csrfToken;
    
    if (!token) {
      return res.status(403).json({
        error: 'CSRF token required'
      });
    }
  }
  next();
};