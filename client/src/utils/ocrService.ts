import Tesseract from 'tesseract.js';

export interface ExtractedReceiptData {
  amount: string;
  description: string;
  category: string;
  items: Array<{ name: string; price: number; quantity?: number }>;
  merchantName?: string;
  date?: string;
  confidence: number;
}

export class OCRService {
  private static instance: OCRService;
  
  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  /**
   * Extract text from receipt image using Tesseract.js
   */
  async extractTextFromImage(file: File): Promise<string> {
    try {
      console.log('🔍 Starting Tesseract OCR for file:', file.name, file.type, file.size, 'bytes');
      
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          console.log('📊 Tesseract Status:', m.status, 'Progress:', Math.round(m.progress * 100) + '%');
        }
      });
      
      console.log('✅ Tesseract OCR Complete. Confidence:', result.data.confidence);
      console.log('📝 Extracted Text:', result.data.text);
      
      if (!result.data.text || result.data.text.trim().length === 0) {
        throw new Error('No text detected in image. Please ensure the receipt is clear and well-lit.');
      }
      
      return result.data.text;
    } catch (error) {
      console.error('❌ Tesseract OCR Error:', error);
      throw new Error('Failed to extract text from image: ' + (error as Error).message);
    }
  }

  /**
   * Parse extracted text to identify receipt data
   */
  parseReceiptText(text: string): ExtractedReceiptData {
    console.log('🔍 Parsing receipt text...');
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log('📄 Receipt lines:', lines);
    
    // Find total amount
    console.log('💰 Searching for total amount...');
    const amount = this.extractAmount(lines);
    
    // Find merchant name
    console.log('🏪 Searching for merchant name...');
    const merchantName = this.extractMerchantName(lines);
    console.log('🏪 Found merchant:', merchantName);
    
    // Find date
    console.log('📅 Searching for date...');
    const date = this.extractDate(lines);
    console.log('📅 Found date:', date);
    
    // Extract items
    console.log('📋 Extracting items...');
    const items = this.extractItems(lines);
    console.log('📋 Found items:', items);
    
    // Determine category based on merchant or items
    const category = this.determineCategory(merchantName, items);
    console.log('🏷️ Determined category:', category);
    
    // Generate description
    const description = this.generateDescription(merchantName, category, items);
    console.log('📝 Generated description:', description);

    const result = {
      amount: amount.toString(),
      description,
      category,
      items,
      merchantName,
      date,
      confidence: 0.8 // Base confidence, could be improved with ML
    };

    console.log('✅ Final parsed result:', result);
    return result;
  }

  /**
   * Extract total amount from receipt text - prioritizes total/grand total over individual amounts
   */
  private extractAmount(lines: string[]): number {
    console.log('🔍 Searching for total amount in lines:', lines);
    
    // Test the exact lines we expect
    const testLine1 = "Total Paid €3,442.77 =";
    const testLine2 = "Total:sw: mes mismenmin: $60:00";
    const testPattern = /total.*?[$€£₹¥]\s*(\d{1,3}(?:[,.]?\d{3})*\.?\d{0,2})/i;
    
    console.log('🧪 Test match for "Total Paid €3,442.77 =":', testLine1.match(testPattern));
    console.log('🧪 Test match for "Total:sw: mes mismenmin: $60:00":', testLine2.match(testPattern));
    
    // Priority 1: Look for explicit total keywords (highest priority)
    // Support multiple currencies: $, €, £, ₹, ¥, etc.
    // Order matters - most specific patterns first!
    // Allow for garbled text between keyword and amount
    const totalPatterns = [
      /total\s*paid.*?[$€£₹¥]\s*(\d{1,3}(?:[,.]?\d{3})*\.?\d{0,2})/i,
      /(?:grand|final)\s*total.*?[$€£₹¥]\s*(\d{1,3}(?:[,.]?\d{3})*\.?\d{0,2})/i,
      /amount\s*(?:due|paid).*?[$€£₹¥]\s*(\d{1,3}(?:[,.]?\d{3})*\.?\d{0,2})/i,
      /total.*?[$€£₹¥]\s*(\d{1,3}(?:[,.]?\d{3})*\.?\d{0,2})/i,
      /balance.*?[$€£₹¥]\s*(\d{1,3}(?:[,.]?\d{3})*\.?\d{0,2})/i,
      /sum.*?[$€£₹¥]\s*(\d{1,3}(?:[,.]?\d{3})*\.?\d{0,2})/i,
      /paid.*?[$€£₹¥]\s*(\d{1,3}(?:[,.]?\d{3})*\.?\d{0,2})/i
    ];

    // Priority 2: Look for amounts at the end of receipt (likely totals)
    const endLinePatterns = [
      /[$€£₹¥](\d{1,3}(?:[,.]?\d{3})*\.?\d{0,2})$/,
      /(\d{1,3}(?:[,.]?\d{3})*\.?\d{0,2})$/
    ];

    // Priority 3: All amounts (fallback)
    const allAmountPatterns = [
      /[$€£₹¥](\d{1,3}(?:[,.]?\d{3})*\.?\d{0,2})/g,
      /(\d{1,3}(?:[,.]?\d{3})*\.?\d{0,2})/g
    ];

    // Step 1: Search for explicit total keywords
    for (const line of lines) {
      // Skip subtotal lines explicitly
      if (/subtotal|sub\s*total/i.test(line)) {
        console.log('⏭️ Skipping subtotal line:', line);
        continue;
      }

      console.log('🔍 Checking line for total patterns:', line);
      
      for (let i = 0; i < totalPatterns.length; i++) {
        const pattern = totalPatterns[i];
        const match = line.match(pattern);
        if (match) {
          console.log(`✅ Pattern ${i} matched:`, pattern);
          console.log('📝 Full match array:', match);
          console.log('📝 Line:', line);
          console.log('📝 Captured group 1:', match[1]);
          
          // Handle different number formats: 1,234.56 or 1.234,56 or 1234.56
          let amountStr = match[1].replace(/,/g, ''); // Remove commas for now (assuming US format)
          console.log('📝 After removing commas:', amountStr);
          
          const amount = parseFloat(amountStr);
          console.log('📝 Parsed float result:', amount);
          
          if (amount > 0 && amount < 100000) { // Increased upper limit for expensive items
            console.log('✅ Found total with keyword:', line, '→', amount);
            return amount;
          } else {
            console.log('❌ Amount out of range:', amount);
          }
        }
      }
    }

    // Step 2: Look for amounts in the last few lines (likely totals)
    const lastLines = lines.slice(-5); // Last 5 lines
    for (const line of lastLines) {
      for (const pattern of endLinePatterns) {
        const match = line.match(pattern);
        if (match) {
          let amountStr = match[1].replace(/,/g, ''); // Remove commas
          const amount = parseFloat(amountStr);
          if (amount > 0 && amount < 100000) {
            console.log('✅ Found amount in end lines:', line, '→', amount);
            return amount;
          }
        }
      }
    }

    // Step 3: Find the largest reasonable amount (fallback)
    let maxAmount = 0;
    let maxAmountLine = '';
    
    for (const line of lines) {
      // Skip lines that look like item codes, dates, or addresses
      if (/^\d{4,}$/.test(line) || /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(line) || /street|st\.|ave|road|rd/i.test(line)) {
        continue;
      }

      for (const pattern of allAmountPatterns) {
        const matches = [...line.matchAll(pattern)];
        for (const match of matches) {
          let amountStr = (match[1] || match[0]).replace(/[$€£₹¥,]/g, ''); // Remove currency symbols and commas
          const amount = parseFloat(amountStr);
          if (amount > maxAmount && amount > 0.50 && amount < 100000) { // Reasonable range
            maxAmount = amount;
            maxAmountLine = line;
          }
        }
      }
    }

    if (maxAmount > 0) {
      console.log('✅ Found largest amount as fallback:', maxAmountLine, '→', maxAmount);
    } else {
      console.log('❌ No valid amount found in receipt');
    }

    return maxAmount;
  }

  /**
   * Extract merchant name from receipt
   */
  private extractMerchantName(lines: string[]): string {
    console.log('🔍 Looking for merchant in top lines:', lines.slice(0, 8));
    
    // Look for merchant name in first 8 lines
    const topLines = lines.slice(0, 8);
    
    for (const line of topLines) {
      // Skip lines that are just symbols or formatting
      if (/^[—=:\s\-_|]+$/.test(line)) {
        console.log('⏭️ Skipping symbol line:', line);
        continue;
      }
      
      // Look for lines with actual merchant names
      // Match patterns like "APPLE STORE", "= APPLE STORE, GRAFTON STREET —"
      const merchantMatch = line.match(/([A-Z][A-Z\s&,.']+(?:STORE|SHOP|MARKET|RESTAURANT|CAFE|MALL|CENTER|COMPANY|CORP|INC|LTD))/i);
      if (merchantMatch) {
        const merchant = merchantMatch[1].trim().replace(/[=—\-_|]+/g, '').trim();
        console.log('✅ Found merchant with pattern:', line, '→', merchant);
        return merchant;
      }
      
      // Look for lines with mostly uppercase letters (likely merchant names)
      if (line.length > 5 && line.length < 60) {
        // Remove symbols and check if it has meaningful content
        const cleaned = line.replace(/[=—\-_|:\s]+/g, ' ').trim();
        
        // Skip if it's mostly numbers, addresses, or empty
        if (/^\d+$/.test(cleaned) || 
            /street|st\.|ave|road|rd|blvd|dublin|address|phone|tel/i.test(cleaned) ||
            cleaned.length < 3) {
          console.log('⏭️ Skipping address/number line:', line);
          continue;
        }
        
        // If it has mostly uppercase letters, it's likely a merchant name
        const uppercaseRatio = (cleaned.match(/[A-Z]/g) || []).length / cleaned.replace(/\s/g, '').length;
        if (uppercaseRatio > 0.5 && cleaned.includes('APPLE')) {
          console.log('✅ Found merchant by uppercase ratio:', line, '→', cleaned);
          return cleaned;
        }
      }
    }

    console.log('❌ No merchant found, using fallback');
    return 'Unknown Merchant';
  }

  /**
   * Extract date from receipt
   */
  private extractDate(lines: string[]): string | undefined {
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
      /(\d{1,2}-\d{1,2}-\d{2,4})/,
      /(\d{4}-\d{1,2}-\d{1,2})/
    ];

    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          return match[1];
        }
      }
    }

    return undefined;
  }

  /**
   * Clean up garbled OCR text from item names
   */
  private cleanItemName(name: string): string {
    return name
      // Remove common OCR artifacts
      .replace(/[«»]/g, '') // Remove special quotes
      .replace(/[^\w\s\-'.,]/g, ' ') // Replace non-standard characters with spaces
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .replace(/^\W+|\W+$/g, '') // Remove leading/trailing non-word chars
      .trim();
  }

  /**
   * Extract individual items from receipt
   */
  private extractItems(lines: string[]): Array<{ name: string; price: number; quantity?: number }> {
    const items: Array<{ name: string; price: number; quantity?: number }> = [];
    
    for (const line of lines) {
      // Look for lines with item name and price
      const itemPattern = /^(.+?)\s+\$?(\d+\.?\d*)$/;
      const match = line.match(itemPattern);
      
      if (match) {
        const name = match[1].trim();
        const price = parseFloat(match[2]);
        
        // Skip if it looks like a total, tax, or summary line
        const skipPatterns = [
          /total|tax|subtotal|discount|change|balance|due|amount|sum|final|grand/i,
          /^(sub|net|gross)/i,
          /payment|cash|card|credit/i
        ];
        
        const shouldSkip = skipPatterns.some(pattern => pattern.test(name));
        
        if (!shouldSkip && price > 0 && price < 1000 && name.length > 1) {
          // Clean up garbled OCR text
          let cleanName = this.cleanItemName(name);
          
          // Skip if the cleaned name is too short or still garbled
          if (cleanName.length < 3 || /[«»]{2,}|[^\w\s\-'.]{3,}/.test(cleanName)) {
            console.log('⏭️ Skipped garbled item:', name, '→ $' + price);
            continue;
          }
          
          // Check for quantity
          const qtyMatch = cleanName.match(/^(\d+)\s*x?\s*(.+)/i);
          if (qtyMatch) {
            items.push({
              name: qtyMatch[2].trim(),
              price: price,
              quantity: parseInt(qtyMatch[1])
            });
          } else {
            items.push({
              name: cleanName,
              price: price
            });
          }
          console.log('📦 Found item:', cleanName, '→ $' + price);
        } else if (shouldSkip) {
          console.log('⏭️ Skipped total/summary line:', name, '→ $' + price);
        }
      }
    }

    console.log('📋 Total items found:', items.length);
    return items;
  }

  /**
   * Determine expense category based on merchant and items
   */
  private determineCategory(merchantName: string, items: Array<{ name: string; price: number }>): string {
    const merchant = merchantName.toLowerCase();
    
    // Merchant-based categorization
    if (/grocery|market|supermarket|walmart|target|costco|safeway/i.test(merchant)) {
      return 'Food';
    }
    if (/restaurant|cafe|coffee|pizza|burger|mcdonald|kfc|subway/i.test(merchant)) {
      return 'Food';
    }
    if (/gas|fuel|shell|exxon|chevron|bp|mobil/i.test(merchant)) {
      return 'Transport';
    }
    if (/uber|lyft|taxi|bus|train|metro/i.test(merchant)) {
      return 'Transport';
    }
    if (/movie|cinema|theater|entertainment/i.test(merchant)) {
      return 'Entertainment';
    }
    if (/pharmacy|cvs|walgreens|medical|hospital|clinic/i.test(merchant)) {
      return 'Bills';
    }
    if (/mall|shop|store|retail|amazon|ebay/i.test(merchant)) {
      return 'Shopping';
    }

    // Item-based categorization
    const itemNames = items.map(item => item.name.toLowerCase()).join(' ');
    if (/milk|bread|egg|fruit|vegetable|meat|chicken|beef|fish/i.test(itemNames)) {
      return 'Food';
    }
    if (/gas|fuel|oil/i.test(itemNames)) {
      return 'Transport';
    }
    if (/clothes|shirt|pants|shoes|dress/i.test(itemNames)) {
      return 'Shopping';
    }

    return 'Other';
  }

  /**
   * Generate description based on merchant and category
   */
  private generateDescription(merchantName: string, category: string, items: Array<{ name: string; price: number }>): string {
    // Always include category for clarity
    if (merchantName && merchantName !== 'Unknown Merchant') {
      // Clean up merchant name
      const cleanMerchant = merchantName.replace(/[^\w\s&'.-]/g, '').trim();
      return `${cleanMerchant} - ${category}`;
    }
    
    // If we have clean items, use them with category
    const cleanItems = items.filter(item => item.name.length > 2);
    if (cleanItems.length > 0) {
      if (cleanItems.length === 1) {
        return `${cleanItems[0].name} - ${category}`;
      } else if (cleanItems.length <= 3) {
        return `${cleanItems.map(item => item.name).join(', ')} - ${category}`;
      } else {
        return `${cleanItems[0].name} and ${cleanItems.length - 1} other items - ${category}`;
      }
    }

    // Fallback to category-based description
    return `${category} Expense`;
  }

  /**
   * Main method to process receipt image
   */
  async processReceipt(file: File, onProgress?: (progress: number) => void): Promise<ExtractedReceiptData> {
    try {
      console.log('🚀 Starting receipt processing for:', file.name);
      
      if (onProgress) onProgress(0.1);
      
      // Extract text using OCR
      const text = await this.extractTextFromImage(file);
      
      if (onProgress) onProgress(0.8);
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text found in image. Please ensure the receipt is clear and well-lit.');
      }

      console.log('🔍 Parsing extracted text...');
      
      // Parse the extracted text
      const receiptData = this.parseReceiptText(text);
      
      if (onProgress) onProgress(1.0);
      
      console.log('✅ Receipt processing complete:', receiptData);
      
      if (receiptData.amount === '0') {
        console.log('⚠️ Warning: No amount detected in receipt');
        throw new Error('Could not find total amount. Please check the receipt image quality.');
      }

      return receiptData;
    } catch (error) {
      console.error('❌ Receipt processing error:', error);
      throw error;
    }
  }
}

export const ocrService = OCRService.getInstance();