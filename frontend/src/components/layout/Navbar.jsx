import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  PlusCircle, 
  FileText, 
  MapPin, 
  BarChart3, 
  Shield, 
  Users, 
  Layers, 
  LogOut, 
  Menu, 
  X, 
  User, 
  Home, 
  CheckSquare
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isCitizen, isStaff, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-800 transition">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-700 transition">
                  Civic<span className="text-blue-600">Fix</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-600 -mt-1">
                  Public Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Home
              </Link>

              <Link
                to="/map"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/map') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-4 h-4 text-slate-600" />
                Live Map
              </Link>

              {/* Citizen Links */}
              {isAuthenticated && isCitizen && (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/dashboard') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Dashboard
                  </Link>
                  <Link
                    to="/report"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/report') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-blue-600" />
                    Report Issue
                  </Link>
                  <Link
                    to="/my-complaints"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/my-complaints') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Complaints
                  </Link>
                </>
              )}

              {/* Staff Links */}
              {isAuthenticated && isStaff && (
                <>
                  <Link
                    to="/authority/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/authority/dashboard') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Staff Dashboard
                  </Link>
                  <Link
                    to="/authority/complaints"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/authority/complaints') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    Manage Complaints
                  </Link>
                  <Link
                    to="/analytics"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/analytics') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    Analytics
                  </Link>
                </>
              )}

              {/* Admin Links */}
              {isAuthenticated && isAdmin && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/admin/dashboard') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Admin Console
                  </Link>
                  <Link
                    to="/authority/complaints"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/authority/complaints') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    All Complaints
                  </Link>
                  <Link
                    to="/admin/categories"
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/admin/categories') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-slate-500" />
                    Categories
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/admin/users') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-4 h-4 text-slate-500" />
                    Users
                  </Link>
                  <Link
                    to="/analytics"
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/analytics') ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-slate-500" />
                    Reports
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* User Account / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                    {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-900 leading-tight">
                      {user?.fullName || user?.username}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      {user?.role?.replace('ROLE_', '')}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-blue-700 px-3 py-2 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-3.5 py-1.5 border border-transparent text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
                >
                  Register as Citizen
                </Link>
                <Link
                  to="/register/staff"
                  className="inline-flex items-center justify-center px-3 py-1.5 border border-indigo-200 text-xs font-semibold rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
                >
                  Staff Portal
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/map"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Live Issues Map
          </Link>

          {isAuthenticated ? (
            <>
              {isCitizen && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Citizen Dashboard
                  </Link>
                  <Link
                    to="/report"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50 font-semibold"
                  >
                    + Report New Issue
                  </Link>
                  <Link
                    to="/my-complaints"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Complaints
                  </Link>
                </>
              )}

              {(isStaff || isAdmin) && (
                <>
                  <Link
                    to="/authority/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Staff Dashboard
                  </Link>
                  <Link
                    to="/authority/complaints"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Manage Complaints
                  </Link>
                  <Link
                    to="/analytics"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Analytics & Reports
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Admin Console
                  </Link>
                  <Link
                    to="/admin/categories"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Manage Categories
                  </Link>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Manage Users
                  </Link>
                </>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-slate-800"
                >
                  My Profile ({user?.username})
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm text-rose-600 font-semibold"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 text-slate-800 font-medium border border-slate-200 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 bg-blue-600 text-white font-medium rounded-lg"
              >
                Register as Citizen
              </Link>
              <Link
                to="/register/staff"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium rounded-lg"
              >
                Register as Staff
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
