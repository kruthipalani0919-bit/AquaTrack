import api from './api';

/**
 * Expense Management Service
 */
export const createExpense = async (data) => {
  try {
    const response = await api.post('/expenses', data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to add expense');
  }
};

export const getExpenses = async () => {
  try {
    const response = await api.get('/expenses');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch expenses');
  }
};

export const getExpenseCategories = async () => {
  try {
    const response = await api.get('/expenses/categories');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch expense categories');
  }
};

export const getExpenseSummary = async () => {
  try {
    const response = await api.get('/expenses/summary');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch expense summary');
  }
};

export const getExpenseById = async (id) => {
  try {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to fetch expense #${id}`);
  }
};

export const updateExpense = async (id, data) => {
  try {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to update expense #${id}`);
  }
};

export const deleteExpense = async (id, password) => {
  try {
    const response = await api.delete(`/expenses/${id}`, {
      data: { password },
      headers: { 'x-confirm-password': password }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to delete expense #${id}`);
  }
};

export const expenseService = {
  createExpense,
  getExpenses,
  getExpenseCategories,
  getExpenseSummary,
  getExpenseById,
  updateExpense,
  deleteExpense,
};

export default expenseService;

