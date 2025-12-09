# Smart Expense Tracker

A full-stack expense tracking application with group expense splitting, receipt scanning, and analytics.

## Features

### Core Features
- 👤 **User Authentication** - Secure JWT-based login/register
- 💰 **Expense Tracking** - Add, edit, delete expenses with categories
- 💵 **Income Tracking** - Track multiple income sources
- 🎯 **Budget Management** - Set monthly limits per category with alerts
- 📊 **Advanced Analytics** - Dashboard with charts and trends
- 👥 **Group Expenses** - Split bills with friends/roommates
- 🔄 **Recurring Expenses** - Auto-track monthly bills (rent, subscriptions)
- 💳 **Payment Methods** - Track Cash, UPI, Card, Net Banking, Wallet
- 📸 **Receipt Upload** - Attach receipt images to expenses
- 📝 **Notes** - Add additional notes to transactions
- 🔔 **Real-time Updates** - Socket.io for live group updates
- 📱 **Mobile Responsive** - Works perfectly on all devices

### Analytics & Insights
- Monthly income vs expenses comparison
- Category-wise spending breakdown (Pie chart)
- Payment method analysis (Bar chart)
- Daily spending trends (Line chart)
- Budget alerts when limits are exceeded
- Savings rate calculation
- Month-over-month comparison

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts (for analytics)
- Socket.io-client

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT authentication
- Socket.io
- Multer (file uploads)

## Project Structure

```
expense-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API calls
│   │   ├── hooks/         # Custom hooks
│   │   ├── context/       # Context providers
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Helper functions
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, validation
│   │   ├── services/      # Business logic
│   │   ├── prisma/        # Database schema
│   │   └── types/         # TypeScript types
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

3. Set up environment variables (see .env.example files)

4. Run database migrations:
   ```bash
   cd server && npx prisma migrate dev
   ```

5. Start development servers:
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev

   # Terminal 2 - Frontend
   cd client && npm run dev
   ```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/expenses` - Get user expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/groups` - Get user groups
- `POST /api/groups` - Create group
- `POST /api/groups/:id/expenses` - Add group expense

## License

MIT
