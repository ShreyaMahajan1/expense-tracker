import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">💰 Expense Tracker</Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-blue-200 transition">Dashboard</Link>
            <Link to="/expenses" className="hover:text-blue-200 transition">Expenses</Link>
            <Link to="/income" className="hover:text-blue-200 transition">Income</Link>
            <Link to="/budget" className="hover:text-blue-200 transition">Budget</Link>
            <Link to="/groups" className="hover:text-blue-200 transition">Groups</Link>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-blue-500">
              <Link to="/profile" className="hover:text-blue-200 transition">⚙️ Profile</Link>
              <button onClick={handleLogout} className="bg-blue-700 px-4 py-1 rounded hover:bg-blue-800 transition">
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden mt-4 space-y-2">
          <Link to="/" className="block py-2 hover:bg-blue-700 px-2 rounded transition">Dashboard</Link>
          <Link to="/expenses" className="block py-2 hover:bg-blue-700 px-2 rounded transition">Expenses</Link>
          <Link to="/income" className="block py-2 hover:bg-blue-700 px-2 rounded transition">Income</Link>
          <Link to="/budget" className="block py-2 hover:bg-blue-700 px-2 rounded transition">Budget</Link>
          <Link to="/groups" className="block py-2 hover:bg-blue-700 px-2 rounded transition">Groups</Link>
          <Link to="/profile" className="block py-2 hover:bg-blue-700 px-2 rounded transition">⚙️ Profile</Link>
          <div className="pt-2 border-t border-blue-500">
            <p className="text-sm mb-2">{user?.name}</p>
            <button onClick={handleLogout} className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-800 transition w-full">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
