import { DEFAULT_FARM_INFO } from '../constants/farmData';
import { DASHBOARD_STATS } from '../constants/dashboardData';

/**
 * Farm Service (Mock Promises)
 */
export const farmService = {
  async getFarmDetails() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: DEFAULT_FARM_INFO });
      }, 300);
    });
  },

  async saveFarmSetup(farmData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Farm setup saved successfully', data: farmData });
      }, 500);
    });
  },

  async getDashboard() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, stats: DASHBOARD_STATS });
      }, 300);
    });
  },
};

export default farmService;
