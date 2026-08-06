import api from './api';

/**
 * Dashboard Service
 */
export const getDashboard = async () => {
  try {
    const response = await api.get('/dashboard');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch dashboard data');
  }
};

export const dashboardService = {
  getDashboard,
};

export default dashboardService;
