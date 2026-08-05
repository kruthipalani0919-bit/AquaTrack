/**
 * Feed Service (Mock Promises)
 */
export const feedService = {
  async getFeedLogs() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            { id: 1, date: '2026-08-05', pond: 'Pond P-1', feedType: 'Grower #3', quantityKg: 45, checkTray: 'Good' },
            { id: 2, date: '2026-08-05', pond: 'Pond P-2', feedType: 'Starter #2', quantityKg: 30, checkTray: 'Normal' },
          ],
        });
      }, 300);
    });
  },

  async addFeedLog(feedData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Feed log recorded', data: feedData });
      }, 400);
    });
  },
};

export default feedService;
