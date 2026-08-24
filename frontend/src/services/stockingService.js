import api from './api';

/**
 * Stocking Management Service
 * Real API integration with AquaTrack backend (/api/stocking).
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

export const stockingService = {
  createStocking,
  getStockings,
  getStockingById,
  allocateStock,
  getSiteStockAllocations,
};

export default stockingService;
