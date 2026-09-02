import api from './api';

/**
 * Harvest Management Service
 */
export const createHarvest = async (data) => {
  try {
    const response = await api.post('/harvests', data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to record harvest');
  }
};

export const getHarvests = async () => {
  try {
    const response = await api.get('/harvests');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch harvests');
  }
};

export const getHarvestSummary = async () => {
  try {
    const response = await api.get('/harvests/summary');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch harvest summary');
  }
};

export const getHarvestById = async (id) => {
  try {
    const response = await api.get(`/harvests/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to fetch harvest #${id}`);
  }
};

export const updateHarvest = async (id, data) => {
  try {
    const response = await api.put(`/harvests/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to update harvest #${id}`);
  }
};

export const deleteHarvest = async (id, password) => {
  try {
    const response = await api.delete(`/harvests/${id}`, {
      data: { password },
      headers: { 'x-confirm-password': password }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to delete harvest #${id}`);
  }
};

export const harvestService = {
  createHarvest,
  getHarvests,
  getHarvestSummary,
  getHarvestById,
  updateHarvest,
  deleteHarvest,
};

export default harvestService;
