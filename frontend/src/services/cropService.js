import api from './api';

/**
 * Crop Management Service
 */
export const createCrop = async (data) => {
  try {
    const response = await api.post('/crops', data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to create crop');
  }
};

export const getCrops = async () => {
  try {
    const response = await api.get('/crops');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch crops');
  }
};

export const getActiveCrops = async () => {
  try {
    const response = await api.get('/crops/active');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch active crops');
  }
};

export const getCropById = async (id) => {
  try {
    const response = await api.get(`/crops/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to fetch crop #${id}`);
  }
};

export const updateCrop = async (id, data) => {
  try {
    const response = await api.put(`/crops/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to update crop #${id}`);
  }
};

export const completeCrop = async (id) => {
  try {
    const response = await api.patch(`/crops/${id}/complete`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to complete crop #${id}`);
  }
};

export const deleteCrop = async (id) => {
  try {
    const response = await api.delete(`/crops/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to delete crop #${id}`);
  }
};

export const cropService = {
  createCrop,
  getCrops,
  getActiveCrops,
  getCropById,
  updateCrop,
  completeCrop,
  deleteCrop,
};

export default cropService;

