// UPI App Handler for better mobile payment experience

export interface UpiPaymentData {
  payeeUpiId: string;
  payeeName: string;
  amount: number;
  note?: string;
}

export interface UpiApp {
  name: string;
  scheme: string;
  packageName?: string;
  color: string;
  emoji: string;
}

export const UPI_APPS: UpiApp[] = [
  {
    name: 'PayTM',
    scheme: 'paytmmp',
    packageName: 'net.one97.paytm',
    color: 'bg-blue-500',
    emoji: '💳'
  },
  {
    name: 'PhonePe',
    scheme: 'phonepe',
    packageName: 'com.phonepe.app',
    color: 'bg-purple-500',
    emoji: '📱'
  },
  {
    name: 'GPay',
    scheme: 'gpay',
    packageName: 'com.google.android.apps.nbu.paisa.user',
    color: 'bg-green-500',
    emoji: '💰'
  },
  {
    name: 'BHIM',
    scheme: 'bhim',
    packageName: 'in.org.npci.upiapp',
    color: 'bg-orange-500',
    emoji: '🏦'
  },
  {
    name: 'Amazon Pay',
    scheme: 'amazonpay',
    packageName: 'in.amazon.mShop.android.shopping',
    color: 'bg-yellow-500',
    emoji: '📦'
  }
];

export class UpiAppHandler {
  private static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private static isAndroid(): boolean {
    return /Android/i.test(navigator.userAgent);
  }

  private static isIOS(): boolean {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  static generateUpiLink(data: UpiPaymentData): string {
    const { payeeUpiId, payeeName, amount, note } = data;
    const params = new URLSearchParams({
      pa: payeeUpiId,
      pn: payeeName,
      am: amount.toString(),
      cu: 'INR'
    });

    if (note) {
      params.append('tn', note);
    }

    return `upi://pay?${params.toString()}`;
  }

  static generateAppSpecificLink(app: UpiApp, data: UpiPaymentData): string {
    const { payeeUpiId, payeeName, amount, note } = data;
    const params = new URLSearchParams({
      pa: payeeUpiId,
      pn: payeeName,
      am: amount.toString(),
      cu: 'INR'
    });

    if (note) {
      params.append('tn', note);
    }

    return `${app.scheme}://pay?${params.toString()}`;
  }

  static async openUpiApp(data: UpiPaymentData): Promise<boolean> {
    if (!this.isMobile()) {
      // For desktop, just copy UPI ID or show QR
      return false;
    }

    const standardUpiLink = this.generateUpiLink(data);

    try {
      // Try standard UPI link first
      window.location.href = standardUpiLink;

      // For Android, try app-specific intents
      if (this.isAndroid()) {
        setTimeout(() => {
          this.tryAndroidIntents(data);
        }, 1000);
      }

      return true;
    } catch (error) {
      console.error('Failed to open UPI app:', error);
      return false;
    }
  }

  private static tryAndroidIntents(data: UpiPaymentData): void {
    const { payeeUpiId, payeeName, amount, note } = data;
    
    // Try Android intents for popular UPI apps
    const intents = [
      // PhonePe
      `intent://pay?pa=${payeeUpiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR${note ? `&tn=${encodeURIComponent(note)}` : ''}#Intent;scheme=phonepe;package=com.phonepe.app;end`,
      
      // PayTM
      `intent://pay?pa=${payeeUpiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR${note ? `&tn=${encodeURIComponent(note)}` : ''}#Intent;scheme=paytmmp;package=net.one97.paytm;end`,
      
      // Google Pay
      `intent://pay?pa=${payeeUpiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR${note ? `&tn=${encodeURIComponent(note)}` : ''}#Intent;scheme=gpay;package=com.google.android.apps.nbu.paisa.user;end`,
      
      // BHIM
      `intent://pay?pa=${payeeUpiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR${note ? `&tn=${encodeURIComponent(note)}` : ''}#Intent;scheme=bhim;package=in.org.npci.upiapp;end`
    ];

    intents.forEach((intent, index) => {
      setTimeout(() => {
        try {
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = intent;
          document.body.appendChild(iframe);
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 2000);
        } catch (error) {
          console.error(`Failed to try intent ${index}:`, error);
        }
      }, index * 500);
    });
  }

  static async copyUpiId(upiId: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(upiId);
        return true;
      } else {
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement('textarea');
        textArea.value = upiId;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      }
    } catch (error) {
      console.error('Failed to copy UPI ID:', error);
      return false;
    }
  }

  static detectAvailableApps(): UpiApp[] {
    // This is a simplified detection - in a real app, you might want to
    // check if specific apps are installed using app detection techniques
    if (this.isAndroid()) {
      return UPI_APPS;
    } else if (this.isIOS()) {
      // iOS has limited UPI app support
      return UPI_APPS.filter(app => ['GPay', 'PayTM'].includes(app.name));
    } else {
      return [];
    }
  }

  static showUpiAppNotFoundMessage(): void {
    const message = this.isAndroid() 
      ? 'No UPI apps found. Please install PayTM, PhonePe, GPay, or BHIM to make payments.'
      : this.isIOS()
      ? 'Please install a UPI app like GPay or PayTM to make payments.'
      : 'UPI payments are available on mobile devices. Please use the QR code or UPI ID.';
    
    alert(message);
  }
}