// Simple test to verify OCR is working
import { ocrService } from './ocrService';

export const testOCR = async () => {
  console.log('Testing OCR functionality...');
  
  // Create a simple test image with text
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Could not create canvas context');
    return;
  }
  
  // Draw white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 400, 200);
  
  // Draw black text
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText('WALMART SUPERCENTER', 50, 40);
  ctx.fillText('Milk                $4.99', 50, 80);
  ctx.fillText('Bread               $2.50', 50, 110);
  ctx.fillText('Total              $7.49', 50, 150);
  
  // Convert canvas to blob
  return new Promise<void>((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error('Could not create test image');
        resolve();
        return;
      }
      
      const file = new File([blob], 'test-receipt.png', { type: 'image/png' });
      
      try {
        console.log('Processing test receipt...');
        const result = await ocrService.processReceipt(file);
        console.log('OCR Test Result:', result);
        
        if (result.amount && parseFloat(result.amount) > 0) {
          console.log('✅ OCR is working! Extracted amount:', result.amount);
        } else {
          console.log('❌ OCR may not be working properly');
        }
      } catch (error) {
        console.error('❌ OCR Test Failed:', error);
      }
      
      resolve();
    }, 'image/png');
  });
};

// Auto-run test in development
if (process.env.NODE_ENV === 'development') {
  // Run test after a short delay to ensure everything is loaded
  setTimeout(() => {
    testOCR();
  }, 2000);
}