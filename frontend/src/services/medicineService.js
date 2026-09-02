import api from './api';

/**
 * Medicine Management Service
 */
export const createMedicine = async (data) => {
  try {
    const response = await api.post('/medicines', data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to add medicine entry');
  }
};

export const getMedicines = async () => {
  try {
    const response = await api.get('/medicines');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch medicine logs');
  }
};

export const getMedicineSummary = async () => {
  try {
    const response = await api.get('/medicines/summary');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch medicine summary');
  }
};

export const getMedicineById = async (id) => {
  try {
    const response = await api.get(`/medicines/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to fetch medicine #${id}`);
  }
};

export const updateMedicine = async (id, data) => {
  try {
    const response = await api.put(`/medicines/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to update medicine #${id}`);
  }
};

export const deleteMedicine = async (id, password) => {
  try {
    const response = await api.delete(`/medicines/${id}`, {
      data: { password },
      headers: { 'x-confirm-password': password }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to delete medicine #${id}`);
  }
};

export const medicineService = {
  createMedicine,
  getMedicines,
  getMedicineSummary,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
};

export default medicineService;
