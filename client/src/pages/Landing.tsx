import React from "react";
import { Link } from "react-router-dom";

const Landing: React.FC = () => {
  const features = [
    {
      icon: "💸",
      title: "Smart Expense Tracking",
      description:
        "Track your daily expenses with intelligent categorization and receipt scanning. Never lose track of where your money goes.",
      benefits: [
        "Receipt OCR scanning",
        "Auto-categorization",
        "Real-time tracking",
      ],
    },
    {
      icon: "👥",
      title: "Group Expense Splitting",
      description:
        "Split bills effortlessly with friends and family. Automatic calculations, payment reminders, and settlement tracking.",
      benefits: [
        "Equal & custom splits",
        "Payment reminders",
        "Settlement tracking",
      ],
    },
    {
      icon: "💰",
      title: "Income Management",
      description:
        "Monitor multiple income sources and track your financial growth with detailed analytics and projections.",
      benefits: [
        "Multiple income sources",
        "Growth tracking",
        "Financial projections",
      ],
    },
    {
      icon: "🎯",
      title: "Budget Planning",
      description:
        "Set budgets for different categories and get alerts when you're overspending. Stay on track with your financial goals.",
      benefits: ["Budget alerts", "Category limits", "Spending insights"],
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description:
        "Beautiful charts and insights that help you understand your spending patterns and financial habits.",
      benefits: [
        "Interactive charts",
        "Spending patterns",
        "Financial insights",
      ],
    },
    {
      icon: "💳",
      title: "UPI Integration",
      description:
        "Seamless UPI payments with QR codes, payment tracking, and instant settlement notifications.",
      benefits: ["QR code payments", "Instant settlements", "Payment tracking"],
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Sign Up & Connect",
      description:
        "Create your account in seconds and start tracking your expenses immediately.",
      icon: "🚀",
    },
    {
      step: "2",
      title: "Track & Categorize",
      description:
        "Add expenses manually or scan receipts for automatic categorization.",
      icon: "�",
    },
    {
      step: "3",
      title: "Analyze & Budget",
      description:
        "Get insights, set budgets, and optimize your spending habits.",
      icon: "📈",
    },
    {
      step: "4",
      title: "Split & Settle",
      description:
        "Split group expenses and settle payments with integrated UPI.",
      icon: "💫",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                💎
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MoneyFlow
                </h1>
                <p className="text-xs text-gray-600 -mt-1">
                  Smart expense tracking
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="text-left">
                <div className="mb-6">
                  <span className="inline-block bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-6 py-3 rounded-full text-sm font-medium shadow-lg border border-green-200">
                    🎉 Trusted by 10,000+ users worldwide
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Take Control of Your
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent block">
                    Financial Future
                  </span>
                </h1>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  MoneyFlow helps you track expenses, split bills with friends,
                  manage budgets, and make smarter financial decisions with
                  powerful analytics.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 text-center shadow-xl hover:shadow-2xl transform hover:scale-105"
                  >
                    🚀 Start Free Today
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 text-center hover:bg-blue-50"
                  >
                    Sign In
                  </Link>
                </div>

                {/* Key Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-left">
                    <div className="text-2xl mb-2">📱</div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Easy to Use
                    </h3>
                    <p className="text-sm text-gray-600">
                      Intuitive interface designed for everyone
                    </p>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl mb-2">🔒</div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Secure & Private
                    </h3>
                    <p className="text-sm text-gray-600">
                      Your financial data is encrypted and safe
                    </p>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl mb-2">⚡</div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Lightning Fast
                    </h3>
                    <p className="text-sm text-gray-600">
                      Add expenses in seconds, not minutes
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Content - Dashboard Preview */}
              <div className="relative flex justify-end">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-gray-200 w-full max-w-md transform hover:scale-105 transition-all duration-300">
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Dashboard
                    </h3>
                    <span className="text-sm text-gray-500">December 2024</span>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">💸</span>
                        <span className="font-medium text-gray-800 text-sm">
                          Expenses
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        ₹24,580
                      </p>
                      <p className="text-xs text-gray-600">This month</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">💰</span>
                        <span className="font-medium text-gray-800 text-sm">
                          Income
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        ₹52,000
                      </p>
                      <p className="text-xs text-gray-600">This month</p>
                    </div>
                  </div>

                  {/* Budget Progress */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-800 text-sm">
                        Budget Progress
                      </span>
                      <span className="text-xs text-purple-600 font-medium">
                        72% used
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full shadow-sm"
                        style={{ width: "72%" }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600">₹18,000 remaining</p>
                  </div>

                  {/* Recent Expenses */}
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm mb-3">
                      Recent Expenses
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm">🍕</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Lunch
                            </p>
                            <p className="text-xs text-gray-500">
                              Food & Dining
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          ₹450
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm">⛽</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Fuel
                            </p>
                            <p className="text-xs text-gray-500">
                              Transportation
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          ₹2,000
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm">🛒</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Groceries
                            </p>
                            <p className="text-xs text-gray-500">Shopping</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          ₹1,250
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How MoneyFlow Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in minutes with our simple 4-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Money
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From expense tracking to group splitting, MoneyFlow has all the
              tools you need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 transform hover:-translate-y-2 group"
              >
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Trusted by Thousands
            </h2>
            <p className="text-lg text-gray-600">
              Join the growing community of smart money managers
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2 text-blue-600">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-blue-600">₹2Cr+</div>
              <div className="text-gray-600">Money Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-blue-600">50K+</div>
              <div className="text-gray-600">Expenses Logged</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-blue-600">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
              Ready to Take Control of Your Finances?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of users who are already managing their money
              smarter with MoneyFlow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Start Your Journey Today
              </Link>
              <Link
                to="/login"
                className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              No credit card required • Free forever • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  💎
                </div>
                <div>
                  <h3 className="font-bold text-lg">MoneyFlow</h3>
                  <p className="text-sm text-gray-400">
                    Smart expense tracking
                  </p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed max-w-md">
                Empowering individuals and groups to make smarter financial
                decisions through intelligent expense tracking and analytics.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>Expense Tracking</li>
                <li>Group Splitting</li>
                <li>Budget Planning</li>
                <li>Analytics Dashboard</li>
                <li>UPI Integration</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Security</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2025 MoneyFlow. All rights reserved.
            </div>
            <div className="text-sm text-gray-400">Made with ❤️ in India</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
