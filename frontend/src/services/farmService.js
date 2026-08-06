import api from './api';

/**
 * Farm Management Service
 * Backend automatically links farm data to the authenticated user.
 * Do NOT send userId or farmId in requests.
 */
export const createFarm = async (data) => {
  try {
    const response = await api.post('/farms', data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to create farm');
  }
};

export const getFarm = async () => {
  try {
    const response = await api.get('/farms');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch farm details');
  }
};

export const updateFarm = async (data) => {
  try {
    const response = await api.put('/farms', data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update farm details');
  }
};

export const farmService = {
  createFarm,
  getFarm,
  updateFarm,
};

export default farmService;
