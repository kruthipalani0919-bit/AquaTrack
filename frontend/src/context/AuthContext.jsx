import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import farmService from '../services/farmService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateFarm = useCallback((newFarmData) => {
    if (newFarmData) {
      setFarm((prev) => ({ ...(prev || {}), ...newFarmData }));
    }
  }, []);

  const refreshAuthData = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setUser(null);
      setFarm(null);
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch user profile
      const profileRes = await authService.getProfile();
      const userData = profileRes?.data || profileRes;
      setUser(userData);

      // 2. Fetch farm details
      try {
        const farmRes = await farmService.getFarm();
        const farmData = farmRes?.data || farmRes;
        if (farmData && (farmData.farmName || farmData.id)) {
          setFarm(farmData);
        }
      } catch (farmErr) {
        // Keep existing farm if fetch fails
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      if (err.status === 401) {
        await authService.logout();
        setToken(null);
        setUser(null);
        setFarm(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuthData();
  }, [refreshAuthData, token]);

  // Listen for global farm updates across frontend components
  useEffect(() => {
    const handleFarmUpdated = (event) => {
      if (event?.detail) {
        updateFarm(event.detail);
      }
      refreshAuthData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('aquatrack:farm-updated', handleFarmUpdated);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('aquatrack:farm-updated', handleFarmUpdated);
      }
    };
  }, [refreshAuthData, updateFarm]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const newToken = localStorage.getItem('token');
    setToken(newToken);
    await refreshAuthData();
    return res;
  };

  const register = async (userData) => {
    await authService.logout();
    setToken(null);
    setUser(null);
    setFarm(null);
    return await authService.register(userData);
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
    setFarm(null);
  };

  const isAuthenticated = Boolean(token);
  const farmName = farm?.farmName || user?.farmName || '';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        farm,
        farmName,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateFarm,
        fetchProfile: refreshAuthData,
        refreshAuthData,
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
