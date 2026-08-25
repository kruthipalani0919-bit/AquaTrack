import api from './api';

/**
 * Stocking Management Service
 * Communicates with backend /stocking API routes.
 * Authentication token attached automatically via api.js interceptor.
 */

// Create Farm Stock (POST /api/stocking)
export const createStocking = async (data) => {
  try {
    const response = await api.post('/stocking', data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to create farm stock');
  }
};

// Get all Farm Stock (GET /api/stocking)
export const getStockings = async () => {
  try {
    const response = await api.get('/stocking');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch farm stock overview');
  }
};

// Get Stocking by ID (GET /api/stocking/:id)
export const getStockingById = async (id) => {
  try {
    const response = await api.get(`/stocking/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to fetch stock #${id}`);
  }
};

// Allocate Stock to Site (POST /api/stocking/:id/allocate)
export const allocateStock = async (stockingId, data) => {
  try {
    const response = await api.post(`/stocking/${stockingId}/allocate`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to allocate stock to site');
  }
};

// Get Stock Allocations for a Site (GET /api/stocking/site/:siteId)
export const getSiteStockAllocations = async (siteId) => {
  try {
    const response = await api.get(`/stocking/site/${siteId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to fetch allocations for site #${siteId}`);
  }
};

// Update Farm Stock (PUT /api/stocking/:id)
export const updateStocking = async (id, data) => {
  try {
    const response = await api.put(`/stocking/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update farm stock');
  }
};

// Delete Farm Stock (DELETE /api/stocking/:id)
export const deleteStocking = async (id) => {
  try {
    const response = await api.delete(`/stocking/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete farm stock');
  }
};

// Update Site Stock Allocation (PUT /api/stocking/allocation/:id)
export const updateAllocation = async (allocationId, data) => {
  try {
    const response = await api.put(`/stocking/allocation/${allocationId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to update site stock allocation');
  }
};

// Delete Site Stock Allocation (DELETE /api/stocking/allocation/:id)
export const deleteAllocation = async (allocationId) => {
  try {
    const response = await api.delete(`/stocking/allocation/${allocationId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete site stock allocation');
  }
};

export const stockingService = {
  createStocking,
  getStockings,
  getStockingById,
  updateStocking,
  deleteStocking,
  allocateStock,
  updateAllocation,
  deleteAllocation,
  getSiteStockAllocations,
};

export default stockingService;
