import api from './api';

/**
 * Tank Management Service
 * Backend automatically links tanks to the logged-in user's farm.
 * Do NOT send farmId in requests.
 */
export const createTank = async (data) => {
  try {
    const response = await api.post('/tanks', data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to create tank');
  }
};

export const getTanks = async () => {
  try {
    const response = await api.get('/tanks');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch tanks list');
  }
};

export const getTank = async (id) => {
  try {
    const response = await api.get(`/tanks/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to fetch tank #${id}`);
  }
};

export const updateTank = async (id, data) => {
  try {
    const response = await api.put(`/tanks/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to update tank #${id}`);
  }
};

export const deleteTank = async (id, password) => {
  try {
    const response = await api.delete(`/tanks/${id}`, {
      data: { password },
      headers: { 'x-confirm-password': password }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to delete tank #${id}`);
  }
};

export const tankService = {
  createTank,
  getTanks,
  getTank,
  updateTank,
  deleteTank,
};

export default tankService;
