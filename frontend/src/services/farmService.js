import api from './api';

/**
 * Farm Management Service
 * Backend automatically links farm data to the authenticated user.
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

export const updateFarm = async (id, data) => {
  try {
    const response = await api.put(`/farms/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update farm details');
  }
};

export const deleteFarm = async (id) => {
  try {
    const response = await api.delete(`/farms/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete farm');
  }
};

export const farmService = {
  createFarm,
  getFarm,
  updateFarm,
  deleteFarm,
};

export default farmService;

