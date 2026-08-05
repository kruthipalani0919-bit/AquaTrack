/**
 * Crop Service (Mock Promises)
 */
export const cropService = {
  async getCrops() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            { id: 1, pondName: 'Pond P-1', species: 'Penaeus vannamei', doc: 48, stockedCount: 150000, survivalRate: '88%' },
            { id: 2, pondName: 'Pond P-2', species: 'Penaeus vannamei', doc: 35, stockedCount: 120000, survivalRate: '92%' },
          ],
        });
      }, 300);
    });
  },

  async addCrop(cropData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Crop batch registered', data: cropData });
      }, 400);
    });
  },
};

export default cropService;
