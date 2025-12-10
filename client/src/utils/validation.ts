// Frontend validation utilities

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Validate expense amount
export const validateAmount = (amount: number | string): ValidationResult => {
  const errors: string[] = [];
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    errors.push('Amount must be a valid number');
  } else if (numAmount <= 0) {
    errors.push('Amount must be greater than 0');
  } else if (numAmount > 999999.99) {
    errors.push('Amount cannot exceed $999,999.99');
  } else if (!/^\d+(\.\d{1,2})?$/.test(amount.toString())) {
    errors.push('Amount can have at most 2 decimal places');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate description
export const validateDescription = (description: string): ValidationResult => {
  const errors: string[] = [];
  const trimmed = description.trim();

  if (!trimmed) {
    errors.push('Description is required');
  } else if (trimmed.length < 1) {
    errors.push('Description must be at least 1 character');
  } else if (trimmed.length > 200) {
    errors.push('Description cannot exceed 200 characters');
  } else if (!/^[a-zA-Z0-9\s\-_.,!?()]+$/.test(trimmed)) {
    errors.push('Description contains invalid characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate transaction ID
export const validateTransactionId = (transactionId: string): ValidationResult => {
  const errors: string[] = [];
  const trimmed = transactionId.trim();

  if (!trimmed) {
    errors.push('Transaction ID is required');
  } else if (trimmed.length < 1) {
    errors.push('Transaction ID must be at least 1 character');
  } else if (trimmed.length > 50) {
    errors.push('Transaction ID cannot exceed 50 characters');
  } else if (!/^[a-zA-Z0-9\-_]+$/.test(trimmed)) {
    errors.push('Transaction ID can only contain letters, numbers, hyphens, and underscores');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate UPI ID
export const validateUpiId = (upiId: string): ValidationResult => {
  const errors: string[] = [];
  const trimmed = upiId.trim();

  if (!trimmed) {
    errors.push('UPI ID is required');
  } else if (!/^[\w.-]+@[\w.-]+$/.test(trimmed)) {
    errors.push('Please provide a valid UPI ID (e.g., user@paytm)');
  } else if (trimmed.length > 50) {
    errors.push('UPI ID cannot exceed 50 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate phone number
export const validatePhoneNumber = (phoneNumber: string): ValidationResult => {
  const errors: string[] = [];
  const trimmed = phoneNumber.trim();

  if (trimmed && !/^\+?[1-9]\d{1,14}$/.test(trimmed)) {
    errors.push('Please provide a valid phone number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate name
export const validateName = (name: string): ValidationResult => {
  const errors: string[] = [];
  const trimmed = name.trim();

  if (!trimmed) {
    errors.push('Name is required');
  } else if (trimmed.length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (trimmed.length > 50) {
    errors.push('Name cannot exceed 50 characters');
  } else if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
    errors.push('Name can only contain letters and spaces');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate email
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    errors.push('Please provide a valid email address');
  } else if (trimmed.length > 100) {
    errors.push('Email cannot exceed 100 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate password
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  } else if (password.length > 128) {
    errors.push('Password cannot exceed 128 characters');
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one lowercase letter, one uppercase letter, and one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Check if user has permission to perform action
export const checkUserPermission = (currentUserId: string, resourceUserId: string): boolean => {
  return currentUserId === resourceUserId;
};

// Validate file upload
export const validateFileUpload = (file: File): ValidationResult => {
  const errors: string[] = [];
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    errors.push('Only JPEG, PNG, and WebP images are allowed');
  }

  if (file.size > maxSize) {
    errors.push('File size cannot exceed 5MB');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rate limiting check (client-side)
export class ClientRateLimit {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// Create rate limiter instances
export const paymentRateLimit = new ClientRateLimit(300000, 3); // 3 payments per 5 minutes
export const generalRateLimit = new ClientRateLimit(60000, 20); // 20 requests per minute