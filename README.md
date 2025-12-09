# Smart Expense Tracker

A full-stack expense tracking application with group bill splitting, budget management, and UPI payment integration.

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with bcrypt password hashing
- Rate limiting (100 requests/15min, 5 login attempts/15min)
- Helmet.js security headers
- NoSQL injection prevention
- XSS protection
- Input sanitization

### 💰 Expense Management
- Add, edit, delete expenses with categories
- Multiple categories: Food, Travel, Rent, Bills, Shopping, Entertainment, Health, Education, Other
- Payment method tracking: Cash, UPI, Card, Net Banking, Wallet
- Receipt image upload
- Notes and descriptions
- Date tracking

### 💵 Income Tracking
- Track multiple income sources
- Categories: Salary, Freelance, Investment, Gift, Other
- Monthly income overview

### 🎯 Budget Management
- Set monthly spending limits per category
- Real-time budget alerts when limits are exceeded
- Budget vs actual spending comparison
- Visual progress indicators

### 📊 Analytics Dashboard
- Monthly income vs expenses comparison
- Category-wise spending breakdown (Pie chart)
- Payment method analysis (Bar chart)
- Savings rate calculation
- Total balance tracking

### 👥 Group Expense Splitting
- Create groups with multiple members
- Add group expenses with automatic equal split
- Real-time balance calculation (who owes whom)
- Settlement tracking
- Group expense history

### 💳 UPI Payment Integration
- Direct peer-to-peer UPI payments
- Set your UPI ID in profile
- Generate UPI payment links
- QR code generation for easy payments
- Manual payment verification with transaction ID
- Settlement history tracking

### 🔔 Real-time Features
- Socket.io integration for live group updates
- Instant notifications for group activities

### 📱 Responsive Design
- Mobile-first design with Tailwind CSS
- Works seamlessly on all devices
- Clean and intuitive UI

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Axios
- Recharts (analytics charts)
- QRCode.react (QR code generation)
- Socket.io-client (real-time updates)

### Backend
- Node.js + Express
- TypeScript
- MongoDB Atlas
- Mongoose ODM
- JWT authentication
- Socket.io (real-time)
- Multer (file uploads)
- Helmet.js (security)
- Express Rate Limit
- Express Mongo Sanitize

## 📁 Project Structure

```
expense-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Navbar, PrivateRoute
│   │   ├── pages/         # Dashboard, Expenses, Income, Budget, Groups, Profile
│   │   ├── context/       # AuthContext
│   │   └── App.tsx
│   ├── public/            # robots.txt, sitemap.xml
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── models/        # Mongoose schemas (User, Expense, Income, Budget, Group, Settlement)
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, security
│   │   ├── config/        # Database, env validation
│   │   └── index.ts
│   ├── uploads/           # Receipt images
│   └── package.json
├── SECURITY.md            # Security documentation
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ShreyaMahajan1/expense-tracker.git
   cd expense-tracker
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**

   **Server (.env):**
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key_min_32_characters
   CLIENT_URL=http://localhost:5173
   ```

   **Client (.env):**
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Expenses
- `GET /api/expenses` - Get user expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Income
- `GET /api/income` - Get user income
- `POST /api/income` - Add income
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income

### Budget
- `GET /api/budget` - Get user budgets
- `POST /api/budget` - Create budget
- `PUT /api/budget/:id` - Update budget
- `DELETE /api/budget/:id` - Delete budget

### Groups
- `GET /api/groups` - Get user groups
- `POST /api/groups` - Create group
- `POST /api/groups/:id/members` - Add member
- `POST /api/groups/:id/expenses` - Add group expense
- `GET /api/groups/:id/balances` - Get group balances

### Settlements
- `POST /api/settlements` - Create settlement
- `PUT /api/settlements/:id/verify` - Verify payment

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile (UPI ID, phone)

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard data

## 📸 Screenshots

### Dashboard
View your financial overview with income, expenses, and savings analytics.

### Group Expenses
Split bills with friends and track who owes whom.

### UPI Payments
Pay directly via UPI with QR codes and payment links.

## 🔒 Security

This application implements multiple security measures:
- JWT authentication with secure token handling
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input sanitization against NoSQL injection
- XSS protection
- Security headers with Helmet.js

See [SECURITY.md](SECURITY.md) for detailed security documentation.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT

## 👤 Author

**Shreya Mahajan**
- GitHub: [@ShreyaMahajan1](https://github.com/ShreyaMahajan1)

## 🙏 Acknowledgments

- Built with React, Node.js, and MongoDB
- UI components styled with Tailwind CSS
- Charts powered by Recharts
- Real-time updates with Socket.io
