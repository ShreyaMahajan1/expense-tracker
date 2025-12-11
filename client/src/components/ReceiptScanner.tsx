import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../utils/toast';
import { ocrService } from '../utils/ocrService';

interface ReceiptScannerProps {
  onReceiptScanned: (data: {
    amount: string;
    description: string;
    category: string;
    items: Array<{ name: string; price: number; quantity?: number }>;
  }) => void;
  onFileSelected: (file: File) => void;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onReceiptScanned, onFileSelected }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  // Initialize OCR and verify Tesseract is available
  useEffect(() => {
    console.log('🔍 ReceiptScanner initialized');
    console.log('📦 Tesseract available:', typeof window !== 'undefined' && 'Tesseract' in window);
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    onFileSelected(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    showInfo('Receipt uploaded! Click "Scan Receipt" to extract data.');
  };

  const scanReceipt = async () => {
    if (!selectedFile) {
      showError('Please select a receipt image first');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    
    try {
      showInfo('Processing receipt... This may take a few moments.');
      
      // Use real OCR service
      const receiptData = await ocrService.processReceipt(
        selectedFile,
        (progress) => setScanProgress(Math.round(progress * 100))
      );
      
      // Validate extracted data
      if (!receiptData.amount || parseFloat(receiptData.amount) === 0) {
        showWarning('Could not detect total amount. Please verify the extracted data.');
      }
      
      onReceiptScanned(receiptData);
      showSuccess(`Receipt scanned successfully! Found ${receiptData.items.length} items totaling $${receiptData.amount}`);
      
    } catch (error: any) {
      console.error('OCR Error:', error);
      showError(error.message || 'Failed to scan receipt. Please ensure the image is clear and try again.');
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };



  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
        {!selectedFile ? (
          <div>
            <div className="text-4xl mb-3">📄</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Upload Receipt</h3>
            <p className="text-sm text-gray-500 mb-4">
              Take a photo or upload an image of your receipt
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                📁 Choose File
              </button>
              <button
                type="button"
                onClick={() => {
                  // In real app, this would open camera
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                📷 Take Photo
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-2xl mb-2">✅</div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500 mb-4">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={scanReceipt}
                disabled={isScanning}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScanning ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {scanProgress > 0 ? `Processing ${scanProgress}%` : 'Initializing...'}
                  </span>
                ) : (
                  '🔍 Scan Receipt'
                )}
              </button>
              <button
                type="button"
                onClick={clearFile}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                🗑️ Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {previewUrl && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
          <img
            src={previewUrl}
            alt="Receipt preview"
            className="max-w-full h-32 object-contain mx-auto rounded border"
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        capture="environment" // Use rear camera on mobile
      />

      <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-2">
          <span className="text-sm">💡</span>
          <div className="text-xs">
            <p className="font-medium mb-1 text-blue-800">
              Receipt Scanning Tips
            </p>
            <ul className="space-y-1 text-xs text-blue-700">
              <li>• Use good lighting - avoid shadows</li>
              <li>• Keep receipt flat and straight</li>
              <li>• Ensure text is clearly visible</li>
              <li>• Processing may take 10-30 seconds</li>
              <li>• Always review extracted data before saving</li>
              <li>• Check browser console for detailed OCR logs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptScanner;