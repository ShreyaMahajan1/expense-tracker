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
    <nav className="glass sticky top-0 z-50 border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
              💎
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gradient">MoneyFlow</h1>
              <p className="text-xs text-gray-600 -mt-1 hidden sm:block">Smart expense tracking</p>
            </div>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-2xl transition-all duration-300 text-sm xl:text-base ${
                  isActive(item.path)
                    ? 'bg-white/30 text-purple-700 shadow-lg backdrop-blur-sm'
                    : 'text-gray-700 hover:bg-white/20 hover:text-purple-600'
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
              className="flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2 rounded-2xl bg-white/20 hover:bg-white/30 transition-all duration-300 group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-700 font-medium group-hover:text-purple-600 transition-colors text-sm xl:text-base hidden xl:inline max-w-24 truncate">
                {user?.name}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 xl:px-6 py-2 rounded-2xl bg-gradient-to-r from-red-400 to-pink-500 text-white font-medium hover:from-red-500 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm xl:text-base"
            >
              <span className="xl:hidden">Exit</span>
              <span className="hidden xl:inline">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-300"
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-6 space-y-3 pb-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-white/30 text-purple-700 shadow-lg'
                    : 'text-gray-700 hover:bg-white/20'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            
            <div className="pt-4 border-t border-white/20 space-y-3">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-gray-700 font-medium text-sm">Notifications</span>
                <NotificationBell />
              </div>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-700 font-medium">{user?.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-red-400 to-pink-500 text-white font-medium hover:from-red-500 hover:to-pink-600 transition-all duration-300 shadow-lg"
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
