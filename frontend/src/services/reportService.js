/**
 * Report Service (Mock Promises)
 */
export const reportService = {
  async getReports() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            { id: 1, title: 'Monthly Farm Performance Report', date: '2026-07-31', type: 'PDF' },
            { id: 2, title: 'FCR & Feed Distribution Summary', date: '2026-08-01', type: 'Excel' },
          ],
        });
      }, 300);
    });
  },

  async generateReport(type) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: `Report (${type}) generated successfully` });
      }, 600);
    });
  },
};

export default reportService;
