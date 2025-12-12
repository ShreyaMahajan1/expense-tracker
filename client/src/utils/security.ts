// Client-side security utilities

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate file uploads
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 5MB.'
    };
  }

  return { valid: true };
};

// Secure token storage
export const secureTokenStorage = {
  set: (token: string) => {
    // Use sessionStorage for more security in production
    if (process.env.NODE_ENV === 'production') {
      sessionStorage.setItem('token', token);
    } else {
      localStorage.setItem('token', token);
    }
  },
  
  get: (): string | null => {
    if (process.env.NODE_ENV === 'production') {
      return sessionStorage.getItem('token');
    } else {
      return localStorage.getItem('token');
    }
  },
  
  remove: () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }
};

// Validate UPI ID format
export const validateUpiId = (upiId: string): boolean => {
  const upiRegex = /^[\w.-]+@[\w.-]+$/;
  return upiRegex.test(upiId) && upiId.length <= 50;
};

// Check for suspicious activity patterns
export const detectSuspiciousActivity = (actions: string[]): boolean => {
  // Check for rapid successive actions (potential bot behavior)
  if (actions.length > 10) {
    const recentActions = actions.slice(-10);
    const timeWindow = 60000; // 1 minute
    const now = Date.now();
    
    const recentCount = recentActions.filter(action => {
      const actionTime = parseInt(action);
      return (now - actionTime) < timeWindow;
    }).length;
    
    return recentCount > 8; // More than 8 actions in 1 minute
  }
  
  return false;
};

// Content Security Policy helpers
export const isAllowedDomain = (url: string): boolean => {
  const allowedDomains = [
    'localhost',
    '127.0.0.1',
    'vercel.app',
    'googleapis.com',
    'gstatic.com',
    'firebaseapp.com'
  ];
  
  try {
    const urlObj = new URL(url);
    return allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
};