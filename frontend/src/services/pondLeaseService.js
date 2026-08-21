import api from './api';

/**
 * Pond Lease Management Service
 */
export const createPondLease = async (data) => {
  try {
    const response = await api.post('/pond-leases', data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to create pond lease');
  }
};

export const getPondLeases = async () => {
  try {
    const response = await api.get('/pond-leases');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch pond leases');
  }
};

export const getPondLeaseById = async (id) => {
  try {
    const response = await api.get(`/pond-leases/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to fetch pond lease #${id}`);
  }
};

export const getLeaseCropAllocations = async (id) => {
  try {
    const response = await api.get(`/pond-leases/${id}/crop-allocations`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to fetch crop allocations for lease #${id}`);
  }
};

export const updatePondLease = async (id, data) => {
  try {
    const response = await api.put(`/pond-leases/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to update pond lease #${id}`);
  }
};

export const deletePondLease = async (id) => {
  try {
    const response = await api.delete(`/pond-leases/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to delete pond lease #${id}`);
  }
};

export const pondLeaseService = {
  createPondLease,
  getPondLeases,
  getPondLeaseById,
  getLeaseCropAllocations,
  updatePondLease,
  deletePondLease,
};

export default pondLeaseService;
