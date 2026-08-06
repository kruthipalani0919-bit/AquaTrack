import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authService.getProfile();
      const userData = res.data || res;
      setUser(userData);
    } catch (err) {
      console.error('Profile fetch error:', err);
      // If token is invalid/expired, logout
      if (err.status === 401) {
        authService.logout();
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const newToken = localStorage.getItem('token');
    const newUser = authService.getCurrentUser();
    setToken(newToken);
    setUser(newUser);
    return res;
  };

  const register = async (userData) => {
    // Ensure any existing authentication state is cleared before registering new user
    await authService.logout();
    setToken(null);
    setUser(null);
    return await authService.register(userData);
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
