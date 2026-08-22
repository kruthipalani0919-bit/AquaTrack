import api from './api';

/**
 * Authentication Service
 */
export const register = async (data) => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
};

export const login = async (data) => {
  try {
    const response = await api.post('/auth/login', data);
    const authData = response.data?.data || response.data;
    const { token, user } = authData;

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('isAuthenticated', 'true');
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
};

export const logout = async () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    throw new Error(error.message || 'Logout failed');
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    if (response.data?.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch user profile');
  }
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return Boolean(token);
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const authService = {
  register,
  login,
  logout,
  getProfile,
  getToken,
  isAuthenticated,
  getCurrentUser,
};

export default authService;

