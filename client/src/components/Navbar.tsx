import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/expenses', label: 'Expenses', icon: '💸' },
    { path: '/income', label: 'Income', icon: '💰' },
    { path: '/budget', label: 'Budget', icon: '🎯' },
    { path: '/groups', label: 'Groups', icon: '👥' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-lg">
              💎
            </div>
            <div>
              <h1 className="text-sm sm:text-xl font-bold text-gray-900">MoneyFlow</h1>
              <p className="text-xs text-gray-600 -mt-1 hidden sm:block">Smart expense tracking</p>
            </div>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-md transition-colors text-sm xl:text-base ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-slate-100 hover:text-blue-600'
                }`}
              >
                <span className="text-base xl:text-lg">{item.icon}</span>
                <span className="font-medium hidden xl:inline">{item.label}</span>
                <span className="font-medium xl:hidden">{item.label.slice(0, 3)}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-4">
            <NotificationBell />
            <Link
              to="/profile"
              className="flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-700 font-medium hover:text-blue-600 transition-colors text-sm xl:text-base hidden xl:inline max-w-24 truncate">
                {user?.name}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 xl:px-6 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors text-sm xl:text-base"
            >
              <span className="xl:hidden">Exit</span>
              <span className="hidden xl:inline">Logout</span>
            </button>
          </div>

          {/* Mobile Right Side */}
          <div className="lg:hidden flex items-center gap-2">
            <NotificationBell />
            <Link
              to="/profile"
              className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-6 space-y-3 pb-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            
            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
