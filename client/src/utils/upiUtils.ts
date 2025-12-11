/**
 * Masks UPI ID to show only last 4 characters before @ and the domain
 * Example: "john.doe@paytm" becomes "xxxx.doe@paytm"
 */
export const maskUpiId = (upiId: string): string => {
  if (!upiId || !upiId.includes('@')) {
    return upiId;
  }

  const [localPart, domain] = upiId.split('@');
  
  if (localPart.length <= 4) {
    return upiId; // Don't mask if too short
  }

  // Keep last 4 characters, mask the rest
  const maskedLocal = 'x'.repeat(localPart.length - 4) + localPart.slice(-4);
  return `${maskedLocal}@${domain}`;
};

/**
 * Validates UPI ID format
 */
export const validateUpiId = (upiId: string): boolean => {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
  return upiRegex.test(upiId);
};

/**
 * Formats UPI ID for display (removes extra spaces, converts to lowercase)
 */
export const formatUpiId = (upiId: string): string => {
  return upiId.trim().toLowerCase();
};