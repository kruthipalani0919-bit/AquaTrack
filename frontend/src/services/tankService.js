/**
 * Tank Service (Mock Promises)
 */
export const tankService = {
  async getTanks() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            { id: 1, name: 'Pond P-1', area: 2.5, depth: 1.8, status: 'Stocked', waterSource: 'Borewell' },
            { id: 2, name: 'Pond P-2', area: 2.0, depth: 1.5, status: 'Stocked', waterSource: 'Creek' },
            { id: 3, name: 'Pond P-3', area: 3.0, depth: 2.0, status: 'Stocked', waterSource: 'Canal' },
            { id: 4, name: 'Pond P-4', area: 2.5, depth: 1.8, status: 'Preparation', waterSource: 'Borewell' },
          ],
        });
      }, 300);
    });
  },

  async addTank(tankData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Tank added successfully', data: tankData });
      }, 400);
    });
  },

  async updateTank(id, tankData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: `Tank ${id} updated`, data: tankData });
      }, 400);
    });
  },
};

export default tankService;
