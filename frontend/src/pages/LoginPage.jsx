import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, User, AlertCircle, Eye, EyeOff, ArrowRight, UserPlus, ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setError("Please enter both username/email and password");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loggedUser = await login(usernameOrEmail.trim(), password);
      // Role-based routing
      if (loggedUser.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else if (loggedUser.role === 'ROLE_STAFF') {
        navigate('/authority/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || "Invalid username or password. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-blue-700 text-white items-center justify-center shadow-lg shadow-blue-600/30 mb-3">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign In to CivicFix
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Access your citizen reports, municipal triage queues, or administration console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 space-y-6">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username or Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Enter your username or registered email"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Registration Options */}
          <div className="pt-5 border-t border-slate-200 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              New to CivicFix? Select Your Account Type:
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 p-2.5 bg-blue-50 hover:bg-blue-100/80 text-blue-700 rounded-xl font-semibold border border-blue-200 transition text-center shadow-xs"
              >
                <UserPlus className="w-4 h-4 text-blue-600" />
                Register as Citizen
              </Link>

              <Link
                to="/register/staff"
                className="flex items-center justify-center gap-2 p-2.5 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 rounded-xl font-semibold border border-indigo-200 transition text-center shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Register as Staff
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default LoginPage;
