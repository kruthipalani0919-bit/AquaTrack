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
    const { token, user } = response.data;

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

export const getToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const isAuthFlag = localStorage.getItem('isAuthenticated') === 'true';
  return Boolean(token) || isAuthFlag;
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : { name: 'Rajesh Kumar', role: 'BlueWave Aqua Farm' };
  } catch {
    return { name: 'Rajesh Kumar', role: 'BlueWave Aqua Farm' };
  }
};

export const authService = {
  register,
  login,
  logout,
  getToken,
  isAuthenticated,
  getCurrentUser,
};

export default authService;
