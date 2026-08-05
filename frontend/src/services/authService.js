/**
 * Authentication Service (Mock Promises)
 */
export const authService = {
  async login(credentials) {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify({
          name: 'Rajesh Kumar',
          email: credentials.identifier || 'rajesh@aquatrack.io',
          role: 'Farm Manager',
          farm: 'BlueWave Aqua Farm',
        }));
        resolve({ success: true, message: 'Login successful' });
      }, 500);
    });
  },

  async register(userData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Registration successful', data: userData });
      }, 500);
    });
  },

  async logout() {
    return new Promise((resolve) => {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      resolve({ success: true, message: 'Logged out successfully' });
    });
  },

  isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true';
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : { name: 'Rajesh Kumar', role: 'BlueWave Aqua Farm' };
    } catch {
      return { name: 'Rajesh Kumar', role: 'BlueWave Aqua Farm' };
    }
  },
};

export default authService;
