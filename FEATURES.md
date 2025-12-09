# Smart Expense Tracker - Complete Feature List

## 🎯 Core Features

### 1. User Authentication
- Secure JWT-based authentication
- Register with email, name, password
- Login with persistent sessions
- Protected routes

### 2. Expense Management 💸
- **Add Expenses** with:
  - Amount
  - Description
  - Category (Food, Transport, Entertainment, Shopping, Bills, Rent, Other)
  - Date
  - Payment Method (Cash, UPI, Card, Net Banking, Wallet)
  - Receipt upload (image)
  - Notes
  - Recurring flag (for monthly bills)
- **View Expenses** in beautiful card layout
- **Delete Expenses**
- **Filter & Search** (coming soon)

### 3. Income Tracking 💰
- Add income from multiple sources:
  - Salary
  - Freelance
  - Business
  - Investment
  - Gift
  - Other
- Track total monthly income
- View income history

### 4. Budget Management 🎯
- Set monthly spending limits per category
- Visual progress bars showing budget usage
- Color-coded alerts:
  - 🟢 Green: Under 50%
  - 🟡 Yellow: 50-75%
  - 🟠 Orange: 75-90%
  - 🔴 Red: 90%+ (Alert!)
- Real-time budget tracking
- Remaining balance calculation

### 5. Advanced Analytics Dashboard 📊
**Top Stats:**
- Total Income
- Total Expenses
- Current Balance (Income - Expenses)
- Month-over-month comparison

**Charts:**
- 📊 Pie Chart: Category-wise spending breakdown
- 📊 Bar Chart: Payment method analysis
- 📈 Line Chart: Daily spending trends

**Quick Insights:**
- Average daily spending
- Highest spending category
- Total transactions
- Savings rate percentage

### 6. Group Expense Splitting 👥
**Create Groups:**
- Name and description
- Add members by email
- Admin and member roles

**Group Expenses:**
- Add expenses to groups
- Automatic equal split among members
- See who paid what
- Track group total spending

**Settlement & Payments:** 💳
- **Balance Calculation**: Automatically calculates who owes whom
- **Payment Requests**: Create settlement requests
- **UPI Integration**: 
  - Generate UPI payment links
  - Opens UPI apps (GPay, PhonePe, Paytm)
  - Format: `upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT`
- **Payment Methods**: UPI, Cash, Bank Transfer, Card
- **Payment Tracking**:
  - Mark payments as paid
  - Add transaction ID
  - Payment history
  - Status: Pending / Paid / Cancelled
- **Balance View**:
  - Green: Amount owed to you
  - Red: Amount you owe
  - Gray: Settled up

### 7. Real-time Features 🔔
- Socket.io integration
- Live updates when group members add expenses
- Real-time balance updates

### 8. Mobile Responsive 📱
- Fully responsive design
- Works on mobile, tablet, desktop
- Touch-friendly interface
- Hamburger menu for mobile

## 🎨 UI/UX Features

### Design Elements:
- **Gradient Cards** for key metrics
- **Color-coded Categories** with emojis
- **Progress Bars** for budgets
- **Interactive Charts** (Recharts library)
- **Modal Dialogs** for payments
- **Hover Effects** and transitions
- **Loading States** with spinners
- **Empty States** with helpful messages

### Navigation:
- Top navbar with all sections
- Breadcrumb navigation
- Back buttons
- Tab-based interfaces

## 🔧 Technical Stack

### Frontend:
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (navigation)
- Axios (API calls)
- Recharts (charts)
- date-fns (date formatting)
- Socket.io-client (real-time)

### Backend:
- Node.js + Express
- TypeScript
- MongoDB Atlas (database)
- Mongoose (ODM)
- JWT (authentication)
- bcryptjs (password hashing)
- Multer (file uploads)
- Socket.io (real-time)
- Zod (validation)

## 📱 Payment Integration

### UPI Payment Setup:
**First-time setup (Required for receiving payments):**
1. Go to Profile (⚙️ in navbar)
2. Click "Edit Profile"
3. Add your UPI ID (e.g., `yourname@paytm`, `9876543210@ybl`)
4. Save changes

**How to find your UPI ID:**
- **PhonePe:** Profile → Your UPI ID
- **Google Pay:** Profile → Payment methods → Show UPI ID
- **Paytm:** Profile → Payment Settings → UPI ID

### UPI Payment Flow:
1. User clicks "Pay Now" on their balance
2. System checks if payee has UPI ID set up (from their profile)
3. Creates settlement request
4. Generates UPI deep link with:
   - **Payee's actual UPI ID** (fetched from their profile)
   - Amount to pay
   - Transaction note
5. User clicks "Pay with UPI App"
6. Opens their preferred UPI app (GPay/PhonePe/Paytm)
7. User completes payment in UPI app
8. User returns and marks payment as paid with transaction ID
9. Payment recorded in history with timestamp

### How We Know Which UPI to Pay:
- ✅ Each user stores their UPI ID in Profile settings
- ✅ When creating payment, system fetches payee's UPI ID from database
- ✅ UPI link generated with actual payee's UPI ID
- ❌ If payee hasn't set UPI ID → Error with helpful message

### Supported Payment Methods:
- 📱 UPI (PhonePe, GPay, Paytm, BHIM, WhatsApp Pay, etc.)
- 💵 Cash
- 🏦 Bank Transfer
- 💳 Card
- 👛 Wallet

## 🚀 Real-World Use Cases

### Personal Finance:
- Track daily expenses
- Monitor income sources
- Set and stick to budgets
- Analyze spending patterns
- Plan savings

### Roommates:
- Split rent and utilities
- Track shared groceries
- Settle up monthly
- See who owes what

### Friends:
- Split dinner bills
- Share travel expenses
- Track group activities
- Easy settlements

### Travel Groups:
- Track trip expenses
- Split costs fairly
- Multiple payment methods
- Complete expense history

## 📈 Future Enhancements (Suggested)

- [ ] Export to CSV/PDF
- [ ] OCR receipt scanning
- [ ] Bank account integration
- [ ] Recurring expense automation
- [ ] Email/SMS notifications
- [ ] Multi-currency support
- [ ] Expense categories customization
- [ ] Goals & savings planning
- [ ] Dark mode
- [ ] Expense search & filters
- [ ] Data backup & restore
- [ ] Multiple wallets
- [ ] Cryptocurrency tracking

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack development (MERN stack)
- RESTful API design
- Authentication & authorization
- Real-time communication
- Payment integration concepts
- Responsive design
- State management
- Database modeling
- File uploads
- Data visualization
- Complex calculations (balances, splits)

## 📝 API Endpoints

### Auth:
- POST `/api/auth/register`
- POST `/api/auth/login`

### Expenses:
- GET `/api/expenses`
- POST `/api/expenses`
- PUT `/api/expenses/:id`
- DELETE `/api/expenses/:id`

### Income:
- GET `/api/income`
- POST `/api/income`
- DELETE `/api/income/:id`

### Budget:
- GET `/api/budget`
- POST `/api/budget`
- DELETE `/api/budget/:id`

### Analytics:
- GET `/api/analytics/summary`

### Groups:
- GET `/api/groups`
- POST `/api/groups`
- POST `/api/groups/:id/members`
- POST `/api/groups/:id/expenses`

### Settlements:
- GET `/api/settlements/group/:groupId/balances`
- GET `/api/settlements/group/:groupId`
- POST `/api/settlements/request`
- POST `/api/settlements/:id/pay`
- POST `/api/settlements/:id/upi-link`

---

**Built with ❤️ for real-world expense management**
