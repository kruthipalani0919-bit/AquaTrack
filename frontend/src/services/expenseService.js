/**
 * Expense Service (Mock Promises)
 */
export const expenseService = {
  async getExpenses() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            { id: 1, category: 'Feed', amount: 5800, date: '2026-08-01', status: 'Paid' },
            { id: 2, category: 'Electricity', amount: 1240, date: '2026-08-03', status: 'Paid' },
            { id: 3, category: 'Medicines', amount: 750, date: '2026-08-04', status: 'Pending' },
          ],
        });
      }, 300);
    });
  },

  async addExpense(expenseData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Expense added', data: expenseData });
      }, 400);
    });
  },
};

export default expenseService;
