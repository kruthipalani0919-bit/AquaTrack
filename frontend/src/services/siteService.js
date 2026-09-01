import api from './api';

/**
 * Site Management Service
 * Communicates with backend /sites API routes.
 * Authentication token attached automatically via api.js interceptor.
 */
export const createSite = async (data) => {
  try {
    const response = await api.post('/sites', data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to create site');
  }
};

export const getSites = async () => {
  try {
    const response = await api.get('/sites');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch sites list');
  }
};

export const getSiteById = async (siteId) => {
  try {
    const response = await api.get(`/sites/${siteId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to fetch site #${siteId}`);
  }
};

export const updateSite = async (siteId, data) => {
  try {
    const response = await api.put(`/sites/${siteId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to update site #${siteId}`);
  }
};

export const deleteSite = async (siteId, password) => {
  try {
    const response = await api.delete(`/sites/${siteId}`, {
      data: { password },
      headers: { 'x-confirm-password': password }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to delete site #${siteId}`);
  }
};

export const siteService = {
  createSite,
  getSites,
  getSiteById,
  updateSite,
  deleteSite,
};

export default siteService;
