# MoneyFlow - Smart Expense Tracker

A comprehensive full-stack expense tracking application with Firebase authentication, group expense splitting, UPI payments, and real-time notifications.

## 🚀 Features

### Core Features
- **Firebase Authentication**: Secure Google OAuth login with Firebase
- **Expense Tracking**: Add, edit, delete, and categorize personal expenses
- **Income Management**: Track multiple income sources and categories
- **Budget Management**: Set monthly budgets with real-time tracking and alerts
- **Analytics Dashboard**: Visual insights with charts and spending patterns

### Advanced Features
- **Group Expense Splitting**: Create groups, add members, and split expenses equally
- **Smart Member Management**: Admin-controlled member addition/removal with role-based permissions
- **UPI Payment Integration**: Direct UPI payments with QR code generation
- **Real-time Native Notifications**: Browser/phone notifications for payment reminders and budget alerts
- **Receipt Scanning**: OCR-powered receipt scanning with automatic expense extraction and form population
- **Mobile Responsive**: Optimized for all devices with touch-friendly interface

### Smart UI Features
- **Conditional Button Display**: Expense/receipt buttons only appear when group has members
- **Admin-Only Controls**: Only group admins can manage members and send payment reminders
- **Real-time Payment Reminders**: Native browser notifications sent to users who owe money
- **Auto-form Population**: Receipt scanning automatically fills expense forms

### Security & Performance
- **Firebase Security**: Google OAuth with Firebase Admin SDK verification
- **Role-based Authorization**: Admin/member permissions with server-side validation
- **Rate Limiting**: Protection against abuse with configurable limits
- **Input Sanitization**: MongoDB injection and XSS protection
- **CORS Configuration**: Secure cross-origin resource sharing
- **Environment-based Configuration**: Separate configs for development and production

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Firebase** for authentication
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **React Toastify** for notifications
- **Recharts** for data visualization
- **Tesseract.js** for OCR functionality
- **QRCode.react** for QR code generation

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Firebase Admin SDK** for authentication verification
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **JWT** for session management
- **Bcrypt** for password hashing
- **Multer** for file uploads
- **Helmet** for security headers
- **Express Rate Limit** for API protection

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Firebase project with Google OAuth enabled
- Git

### Backend Setup
1. Clone the repository:
```bash
git clone https://github.com/ShreyaMahajan1/expense-tracker.git
cd expense-tracker/server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
```

5. Start the development server:
```bash
npm run dev
```

### Frontend Setup
1. Navigate to client directory:
```bash
cd ../client
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Start the development server:
```bash
npm run dev
```

## 🔥 Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Google Authentication in Authentication > Sign-in method
3. Add your domain to authorized domains
4. Generate a service account key for Firebase Admin SDK
5. Configure environment variables with Firebase credentials

## 🚀 Deployment

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard:
   - All variables from `.env.production`
   - Firebase credentials (Project ID, Client Email, Private Key)
3. Deploy with build command: `npm run build`
4. Start command: `npm start`

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - All VITE_ variables from `.env.production`
   - Firebase client configuration
3. Deploy with build command: `npm run build`
4. Output directory: `dist`

## 🔧 Environment Variables

### Backend (.env.production)
```env
MONGODB_URI=mongodb_connection_string
JWT_SECRET=jwt_secret_key
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📱 Usage

1. **Google Login**: Sign in with your Google account via Firebase
2. **Add Expenses**: Track your daily expenses with categories
3. **Set Budgets**: Create monthly budgets and get native browser alerts
4. **Create Groups**: Split expenses with friends and family (admin creates, adds members)
5. **Scan Receipts**: Upload receipts for automatic expense form population
6. **Send Payment Reminders**: Admins can send real-time native notifications to debtors
7. **Make UPI Payments**: Direct UPI payments with QR codes and mobile app integration
8. **Manage Members**: Admins control group membership and permissions
9. **View Analytics**: Monitor spending patterns and trends with real-time updates

## 🔒 Security Features

- Firebase Google OAuth authentication
- Firebase Admin SDK token verification
- JWT-based session management
- Role-based authorization (Admin/Member permissions)
- Server-side permission validation for all member operations
- Rate limiting on API endpoints
- Input sanitization and validation
- CORS protection
- Security headers with Helmet
- MongoDB injection prevention
- Admin-only controls for sensitive operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.


## 🔮 Future Enhancements

- Automated payment verification
- Multi-currency support
- Expense categories customization
- Data export functionality
- Advanced analytics and reporting
- Social login with other providers (Facebook, Apple)
- Push notifications for mobile apps
- Recurring expense automation
- Advanced OCR with multiple receipt formats
- Group expense templates and categories

## 🌐 Live Demo

- **Frontend**: https://expense-tracker-client-shreya.vercel.app
- **Backend**: https://expense-tracker-server-shreya.onrender.com

## 📞 Support

For support, email mahajanshreya792@gmail.com or create an issue on GitHub.