import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('civicfix_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('civicfix_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.data);
            localStorage.setItem('civicfix_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.error("Session expired or invalid:", err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const extractErrorMessage = (err, defaultMsg) => {
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.response?.data?.data && typeof err.response.data.data === 'object') {
      const values = Object.values(err.response.data.data);
      if (values.length > 0) return values.join(', ');
    }
    return err.message || defaultMsg;
  };

  const login = async (usernameOrEmail, password) => {
    try {
      const res = await api.post('/auth/login', { usernameOrEmail, password });
      if (res.data?.success) {
        const data = res.data.data;
        setToken(data.token);
        setUser(data);
        localStorage.setItem('civicfix_token', data.token);
        localStorage.setItem('civicfix_user', JSON.stringify(data));
        return data;
      }
      throw new Error(res.data?.message || 'Login failed');
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'Login failed. Please check your credentials.'));
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data?.success) {
        const data = res.data.data;
        setToken(data.token);
        setUser(data);
        localStorage.setItem('civicfix_token', data.token);
        localStorage.setItem('civicfix_user', JSON.stringify(data));
        return data;
      }
      throw new Error(res.data?.message || 'Registration failed');
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'Registration failed. Username or email may already be taken.'));
    }
  };

  const registerStaff = async (staffData) => {
    try {
      const res = await api.post('/auth/register/staff', staffData);
      if (res.data?.success) {
        const data = res.data.data;
        setToken(data.token);
        setUser(data);
        localStorage.setItem('civicfix_token', data.token);
        localStorage.setItem('civicfix_user', JSON.stringify(data));
        return data;
      }
      throw new Error(res.data?.message || 'Staff registration failed');
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'Staff registration failed. Username or email may already be registered.'));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('civicfix_token');
    localStorage.removeItem('civicfix_user');
  };

  const updateUserProfile = (updatedData) => {
    setUser(prev => {
      const next = { ...prev, ...updatedData };
      localStorage.setItem('civicfix_user', JSON.stringify(next));
      return next;
    });
  };

  const hasRole = (role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    registerStaff,
    logout,
    updateUserProfile,
    hasRole,
    isAuthenticated: !!token,
    isCitizen: user?.role === 'ROLE_CITIZEN',
    isStaff: user?.role === 'ROLE_STAFF',
    isAdmin: user?.role === 'ROLE_ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
