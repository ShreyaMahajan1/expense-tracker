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
 * Common UPI domains that are widely supported
 */
const COMMON_UPI_DOMAINS = [
  'paytm', 'ybl', 'okaxis', 'okicici', 'okhdfcbank', 'okbizaxis', 'fbl',
  'ibl', 'axl', 'upi', 'allbank', 'cnrb', 'sbi', 'pnb', 'boi', 'unionbank',
  'indianbank', 'centralbank', 'cbin', 'vijb', 'jkb', 'rbl', 'yesbankltd',
  'dbs', 'sc', 'hsbc', 'citi', 'kotak', 'indus', 'federal', 'karb', 'kvb',
  'csb', 'cub', 'dcb', 'equitas', 'idbi', 'idfc', 'ippb', 'jab', 'kbl',
  'nkgsb', 'pockets', 'psb', 'rajgovt', 'sib', 'srcb', 'tjsb', 'uco',
  'ujvn', 'utbi', 'bandhan', 'dlb', 'esf', 'fino', 'janalakshmi', 'nainital',
  'rbl', 'suryoday', 'tmb', 'airtel', 'amazonpay', 'freecharge', 'mobikwik',
  'olamoney', 'phonepe', 'whatsapp'
];

/**
 * UPI domains known to have QR code scanning issues
 */
const PROBLEMATIC_QR_DOMAINS = [
  'oksbi', 'okboi', 'okpnb', 'okicici', 'okhdfcbank'
];

/**
 * Validates UPI ID format and checks domain
 */
export const validateUpiId = (upiId: string): { isValid: boolean; error?: string } => {
  if (!upiId || !upiId.trim()) {
    return { isValid: false, error: 'UPI ID is required' };
  }

  const trimmedUpiId = upiId.trim();
  
  // Basic format check
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
  if (!upiRegex.test(trimmedUpiId)) {
    return { isValid: false, error: 'Invalid UPI ID format. Use format: name@bank' };
  }

  const [localPart, domain] = trimmedUpiId.split('@');
  const domainLower = domain?.toLowerCase(); // Only lowercase for validation
  
  // Check local part length
  if (localPart.length < 3) {
    return { isValid: false, error: 'UPI ID username must be at least 3 characters' };
  }

  if (localPart.length > 50) {
    return { isValid: false, error: 'UPI ID username is too long' };
  }

  // Check for problematic QR domains - removed warning
  if (PROBLEMATIC_QR_DOMAINS.includes(domainLower)) {
    return { isValid: true };
  }

  // Check if domain is commonly supported - removed warning
  if (!COMMON_UPI_DOMAINS.includes(domainLower)) {
    return { isValid: true };
  }

  return { isValid: true };
};

/**
 * Simple validation for backward compatibility
 */
export const isValidUpiId = (upiId: string): boolean => {
  return validateUpiId(upiId).isValid;
};

/**
 * Formats UPI ID for display (removes extra spaces, preserves case)
 */
export const formatUpiId = (upiId: string): string => {
  return upiId.trim();
};