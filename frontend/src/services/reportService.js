import api from './api';

/**
 * Report Service consuming real Express backend API endpoints (/api/reports)
 */
export const reportService = {
  /**
   * GET /api/reports/tanks
   * Fetches tanks for reports, with fallback to GET /api/tanks to ensure tank dropdown is always populated.
   */
  async getReportTanks() {
    try {
      const response = await api.get('/reports/tanks');
      const tanks = response.data?.data || response.data || [];
      if (Array.isArray(tanks) && tanks.length > 0) {
        return tanks;
      }
      // Fallback to /tanks endpoint if /reports/tanks returns empty array
      const tankRes = await api.get('/tanks');
      return tankRes.data?.data || tankRes.data || [];
    } catch (error) {
      console.warn('/reports/tanks failed, falling back to /tanks:', error.message);
      try {
        const fallbackRes = await api.get('/tanks');
        return fallbackRes.data?.data || fallbackRes.data || [];
      } catch (fallbackErr) {
        throw new Error(error.message || fallbackErr.message || 'Failed to fetch tanks for reports');
      }
    }
  },

  /**
   * GET /api/reports/tank/:tankId/active
   * Fetches report data for the active crop batch in the specified tank.
   */
  async getActiveTankReport(tankId) {
    if (!tankId) throw new Error('Tank ID is required');
    try {
      const response = await api.get(`/reports/tank/${tankId}/active`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch active tank report');
    }
  },

  /**
   * GET /api/reports/tank/:tankId/completed
   * Fetches list of completed crop batches for the specified tank.
   */
  async getCompletedCrops(tankId) {
    if (!tankId) return [];
    try {
      const response = await api.get(`/reports/tank/${tankId}/completed`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.warn('Completed crops fetch notice:', error.message);
      return [];
    }
  },

  /**
   * GET /api/reports/crop/:cropId
   * Fetches report data for a specific completed crop batch.
   */
  async getCompletedCropReport(cropId) {
    if (!cropId) throw new Error('Crop ID is required');
    try {
      const response = await api.get(`/reports/crop/${cropId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch completed crop report');
    }
  },
};

export default reportService;
