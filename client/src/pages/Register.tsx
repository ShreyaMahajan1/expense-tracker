import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(email, password, name);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400/30 to-orange-400/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/20 to-green-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-4xl shadow-2xl float-animation">
            🚀
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Join MoneyFlow</h1>
          <p className="text-gray-600">Start your smart financial journey today</p>
        </div>

        {/* Register Form */}
        <div className="glass p-8 rounded-3xl shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 border border-red-200/50 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="text-red-500 text-xl">⚠️</span>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-3">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-organic w-full px-6 py-4 text-gray-800 placeholder-gray-500"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-3">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-organic w-full px-6 py-4 text-gray-800 placeholder-gray-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-3">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-organic w-full px-6 py-4 text-gray-800 placeholder-gray-500"
                placeholder="Create a secure password"
                required
              />
              <p className="text-xs text-gray-500 mt-2">Minimum 6 characters required</p>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-gradient w-full py-4 text-white font-semibold rounded-3xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Creating account...
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="text-xl">🎉</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Login */}
          <GoogleLoginButton onError={setError} />

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-gradient font-semibold hover:underline transition-all duration-300"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits Preview */}
        <div className="mt-8 space-y-4">
          <div className="glass p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-xl">
              ✨
            </div>
            <div>
              <p className="font-semibold text-gray-800">Smart Expense Tracking</p>
              <p className="text-sm text-gray-600">Categorize and analyze your spending</p>
            </div>
          </div>
          
          <div className="glass p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xl">
              👥
            </div>
            <div>
              <p className="font-semibold text-gray-800">Group Bill Splitting</p>
              <p className="text-sm text-gray-600">Split expenses with friends easily</p>
            </div>
          </div>
          
          <div className="glass p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
              💳
            </div>
            <div>
              <p className="font-semibold text-gray-800">UPI Payments</p>
              <p className="text-sm text-gray-600">Pay directly with QR codes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
