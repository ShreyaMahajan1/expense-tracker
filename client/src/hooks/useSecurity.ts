import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  validateTransactionId, 
  validateAmount, 
  paymentRateLimit, 
  generalRateLimit,
  checkUserPermission 
} from '../utils/validation';

interface SecurityError {
  message: string;
  type: 'validation' | 'authorization' | 'rate_limit' | 'network';
}

export const useSecurity = () => {
  const { user } = useAuth();
  const [securityErrors, setSecurityErrors] = useState<SecurityError[]>([]);
  const [isSecurityLoading, setIsSecurityLoading] = useState(false);

  // Clear security errors
  const clearSecurityErrors = useCallback(() => {
    setSecurityErrors([]);
  }, []);

  // Add security error
  const addSecurityError = useCallback((error: SecurityError) => {
    setSecurityErrors(prev => [...prev, error]);
  }, []);

  // Validate payment data
  const validatePaymentData = useCallback((
    amount: number, 
    transactionId: string, 
    paymentMethod: string
  ): boolean => {
    clearSecurityErrors();

    // Validate amount
    const amountValidation = validateAmount(amount);
    if (!amountValidation.isValid) {
      amountValidation.errors.forEach(error => 
        addSecurityError({ message: error, type: 'validation' })
      );
      return false;
    }

    // Validate transaction ID
    const transactionValidation = validateTransactionId(transactionId);
    if (!transactionValidation.isValid) {
      transactionValidation.errors.forEach(error => 
        addSecurityError({ message: error, type: 'validation' })
      );
      return false;
    }

    // Validate payment method
    const validMethods = ['UPI', 'Cash', 'Bank Transfer', 'Card'];
    if (!validMethods.includes(paymentMethod)) {
      addSecurityError({ 
        message: 'Invalid payment method selected', 
        type: 'validation' 
      });
      return false;
    }

    return true;
  }, [clearSecurityErrors, addSecurityError]);

  // Check rate limits
  const checkRateLimit = useCallback((action: 'payment' | 'general'): boolean => {
    const userId = user?.id || user?._id || 'anonymous';
    const key = `${userId}-${action}`;

    let canProceed = false;
    if (action === 'payment') {
      canProceed = paymentRateLimit.canMakeRequest(key);
      if (!canProceed) {
        addSecurityError({
          message: 'Too many payment attempts. Please wait before trying again.',
          type: 'rate_limit'
        });
      }
    } else {
      canProceed = generalRateLimit.canMakeRequest(key);
      if (!canProceed) {
        addSecurityError({
          message: 'Too many requests. Please slow down.',
          type: 'rate_limit'
        });
      }
    }

    return canProceed;
  }, [user, addSecurityError]);

  // Check user authorization
  const checkAuthorization = useCallback((resourceUserId: string, action: string): boolean => {
    const currentUserId = user?.id || user?._id;
    
    if (!currentUserId) {
      addSecurityError({
        message: 'You must be logged in to perform this action',
        type: 'authorization'
      });
      return false;
    }

    if (!checkUserPermission(currentUserId, resourceUserId)) {
      addSecurityError({
        message: `You are not authorized to ${action}`,
        type: 'authorization'
      });
      return false;
    }

    return true;
  }, [user, addSecurityError]);

  // Secure API call wrapper
  const secureApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options: {
      requireAuth?: boolean;
      checkRateLimit?: 'payment' | 'general';
      resourceUserId?: string;
      action?: string;
    } = {}
  ): Promise<T | null> => {
    setIsSecurityLoading(true);
    clearSecurityErrors();

    try {
      // Check authentication
      if (options.requireAuth && !user) {
        addSecurityError({
          message: 'Authentication required',
          type: 'authorization'
        });
        return null;
      }

      // Check rate limits
      if (options.checkRateLimit && !checkRateLimit(options.checkRateLimit)) {
        return null;
      }

      // Check authorization
      if (options.resourceUserId && options.action) {
        if (!checkAuthorization(options.resourceUserId, options.action)) {
          return null;
        }
      }

      // Make the API call
      const result = await apiCall();
      return result;

    } catch (error: any) {
      // Handle different types of errors
      if (error.response?.status === 401) {
        addSecurityError({
          message: 'Session expired. Please log in again.',
          type: 'authorization'
        });
      } else if (error.response?.status === 403) {
        addSecurityError({
          message: 'Access denied. You do not have permission for this action.',
          type: 'authorization'
        });
      } else if (error.response?.status === 429) {
        addSecurityError({
          message: 'Too many requests. Please wait before trying again.',
          type: 'rate_limit'
        });
      } else if (error.response?.status >= 400 && error.response?.status < 500) {
        addSecurityError({
          message: error.response?.data?.error || 'Invalid request',
          type: 'validation'
        });
      } else {
        addSecurityError({
          message: 'Network error. Please check your connection and try again.',
          type: 'network'
        });
      }
      return null;
    } finally {
      setIsSecurityLoading(false);
    }
  }, [user, clearSecurityErrors, addSecurityError, checkRateLimit, checkAuthorization]);

  // Validate settlement creation
  const validateSettlementCreation = useCallback((
    groupId: string,
    toUserId: string,
    amount: number
  ): boolean => {
    clearSecurityErrors();

    // Check if user is trying to pay themselves
    const currentUserId = user?.id || user?._id;
    if (currentUserId === toUserId) {
      addSecurityError({
        message: 'You cannot create a settlement to yourself',
        type: 'validation'
      });
      return false;
    }

    // Validate amount
    const amountValidation = validateAmount(amount);
    if (!amountValidation.isValid) {
      amountValidation.errors.forEach(error => 
        addSecurityError({ message: error, type: 'validation' })
      );
      return false;
    }

    // Check rate limit
    if (!checkRateLimit('payment')) {
      return false;
    }

    return true;
  }, [user, clearSecurityErrors, addSecurityError, checkRateLimit]);

  // Sanitize user input
  const sanitizeInput = useCallback((input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }, []);

  // Check if current user can perform action on balance
  const canPerformBalanceAction = useCallback((balance: any, action: string): boolean => {
    const currentUserId = user?.id || user?._id;
    
    if (!currentUserId) {
      return false;
    }

    // User can only pay their own debts
    if (action === 'pay' && balance.userId !== currentUserId) {
      return false;
    }

    // User can only see payment buttons for their own debts
    if (action === 'view_payment_button' && balance.userId !== currentUserId) {
      return false;
    }

    return true;
  }, [user]);

  return {
    securityErrors,
    isSecurityLoading,
    clearSecurityErrors,
    validatePaymentData,
    checkRateLimit,
    checkAuthorization,
    secureApiCall,
    validateSettlementCreation,
    sanitizeInput,
    canPerformBalanceAction,
    currentUserId: user?.id || user?._id
  };
};