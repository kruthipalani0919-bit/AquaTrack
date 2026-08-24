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
      const data = response.data?.data || response.data;
      return await enrichReportData(data, tankId, null);
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
      const data = response.data?.data || response.data;
      return await enrichReportData(data, null, cropId);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch completed crop report');
    }
  },
};

export const getCropReport = async (tankId, type, cropId) => {
  if (type === 'COMPLETED' && cropId) {
    return await reportService.getCompletedCropReport(cropId);
  }
  return await reportService.getActiveTankReport(tankId);
};

export const getCompletedCropsByTank = async (tankId) => {
  return await reportService.getCompletedCrops(tankId);
};

/**
 * Non-blocking Frontend Enrichment Helper to ensure Harvest Date, Expenses, and Pond Lease based on DOC are merged smoothly
 */
async function enrichReportData(reportData, tankId, cropId) {
  if (!reportData) return reportData;

  const targetCropId = cropId || reportData.crop?.id;
  const targetTankId = tankId || reportData.tank?.id;

  try {
    const enrichmentTasks = [];

    // 1. Optional Harvest record enrichment
    if (reportData.crop && (reportData.crop.status === 'COMPLETED' || reportData.crop.status === 'Completed')) {
      enrichmentTasks.push(
        api.get('/harvests').then((harvestsRes) => {
          const rawHarvests = harvestsRes.data?.data || harvestsRes.data || [];
          let savedEdits = {};
          try {
            if (typeof window !== 'undefined') {
              const stored = localStorage.getItem('aquatrack_harvest_edits');
              if (stored) savedEdits = JSON.parse(stored);
            }
          } catch (e) {}

          const harvests = rawHarvests.map((h) => ({
            ...h,
            ...(savedEdits[h.id] || savedEdits[String(h.id)] || {}),
          }));

          const match = harvests.find((h) =>
            (targetCropId && (h.cropId === targetCropId || h.crop?.id === targetCropId)) ||
            (targetTankId && h.crop?.tankId === targetTankId)
          );
          if (match && match.harvestDate && reportData.crop) {
            reportData.crop.harvestDate = match.harvestDate;
          }
        }).catch((hErr) => console.warn('Harvest enrichment notice:', hErr.message))
      );
    }

    // 2. Optional Expense history enrichment
    enrichmentTasks.push(
      api.get('/expenses').then((expensesRes) => {
        const allExpenses = expensesRes.data?.data || expensesRes.data || [];
        const matchedExpenses = allExpenses.filter((e) => {
          if (targetCropId && (e.cropId === targetCropId || e.crop?.id === targetCropId)) return true;
          if (targetTankId && e.crop?.tankId === targetTankId && reportData.crop?.status === 'ACTIVE') return true;
          return false;
        });

        if (matchedExpenses.length > 0) {
          const existingIds = new Set((reportData.expenseHistory || []).map((e) => e.id));
          const newItems = matchedExpenses.filter((e) => !existingIds.has(e.id));

          if (!reportData.expenseHistory) reportData.expenseHistory = [];
          reportData.expenseHistory = [...reportData.expenseHistory, ...newItems];

          const generalExpenseSum = reportData.expenseHistory.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
          if (reportData.summary) {
            reportData.summary.totalExpenseCost = generalExpenseSum;
          }
        }
      }).catch((expErr) => console.warn('Expense enrichment notice:', expErr.message))
    );

    // 3. Optional Pond Lease record enrichment for tank lease daily cost
    if (targetTankId) {
      enrichmentTasks.push(
        api.get('/pond-leases').then((leasesRes) => {
          const leases = leasesRes.data?.data || leasesRes.data || [];
          const match = leases.find((l) =>
            String(l.tankId) === String(targetTankId) || String(l.tank?.id) === String(targetTankId)
          );
          if (match) {
            reportData.tankLease = match;
          }
        }).catch((lErr) => console.warn('Pond lease enrichment notice:', lErr.message))
      );
    }

    // Concurrently wait for optional enrichments with Promise.allSettled
    await Promise.allSettled(enrichmentTasks);
  } catch (err) {
    console.warn('Frontend enrichment notice:', err.message);
  }

  return reportData;
}

export default reportService;
