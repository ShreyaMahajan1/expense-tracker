/**
 * Generate UPI payment link with proper encoding
 */
export const generateUpiLink = (
  upiId: string,
  payeeName: string,
  amount: number,
  note?: string
): string => {
  // Clean and format UPI ID
  const cleanUpiId = upiId.trim().toLowerCase();
  
  // Format amount to 2 decimal places
  const formattedAmount = amount.toFixed(2);
  
  // Default note if not provided
  const paymentNote = note || `Payment to ${payeeName}`;
  
  // Build UPI link parameters
  const params = new URLSearchParams({
    pa: cleanUpiId,           // Payee Address (UPI ID)
    pn: payeeName,           // Payee Name
    am: formattedAmount,     // Amount
    cu: 'INR',               // Currency
    tn: paymentNote          // Transaction Note
  });
  
  const upiLink = `upi://pay?${params.toString()}`;
  
  console.log('UPI Link Debug:', {
    upiId: cleanUpiId,
    payeeName,
    amount: formattedAmount,
    note: paymentNote,
    fullLink: upiLink,
    linkLength: upiLink.length
  });
  
  return upiLink;
};

/**
 * Validate UPI link format
 */
export const validateUpiLink = (upiLink: string): boolean => {
  try {
    const url = new URL(upiLink);
    return url.protocol === 'upi:' && url.pathname === '//pay';
  } catch {
    return false;
  }
};

/**
 * Test UPI link generation with common scenarios
 */
export const testUpiLink = (upiId: string): void => {
  console.log('Testing UPI ID:', upiId);
  
  const testCases = [
    { amount: 100, name: 'Test User', note: 'Test payment' },
    { amount: 50.50, name: 'John Doe', note: 'Group expense settlement' },
    { amount: 1, name: 'Special Chars & Test', note: 'Payment with special chars' }
  ];
  
  testCases.forEach((testCase, index) => {
    const link = generateUpiLink(upiId, testCase.name, testCase.amount, testCase.note);
    const isValid = validateUpiLink(link);
    console.log(`Test ${index + 1}:`, { link, isValid });
  });
};