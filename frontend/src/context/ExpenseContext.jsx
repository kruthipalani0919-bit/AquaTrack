import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import expenseService from '../services/expenseService';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext(null);

export const ExpenseProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async () => {
    if (!isAuthenticated) {
      setExpenses([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await expenseService.getExpenses();
      const list = res.data || res || [];
      const normalized = list.map((item) => ({
        ...item,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : item.date,
        tankName: item.crop?.tank?.tankName || item.tankName || 'Tank',
      }));
      setExpenses(normalized);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses, token]);

  const mapPaymentModeToApi = (mode) => {
    if (!mode) return 'CASH';
    const u = String(mode).trim().toUpperCase();
    if (u.includes('UPI') || u.includes('NET') || u.includes('BANK')) return 'UPI';
    return 'CASH';
  };

  const addExpense = async (newExpenseData) => {
    const payload = {
      tankId: newExpenseData.tankId,
      category: newExpenseData.category,
      description: newExpenseData.description || `${newExpenseData.category} expense`,
      amount: parseFloat(newExpenseData.amount),
      paymentMode: mapPaymentModeToApi(newExpenseData.paymentMode),
      date: newExpenseData.date || new Date().toISOString().split('T')[0],
      notes: newExpenseData.notes || undefined,
    };

    console.log('[ExpenseContext] Creating expense with payload:', payload);
    const res = await expenseService.createExpense(payload);
    const created = res.data || res;
    const normalized = {
      ...created,
      date: created.date ? new Date(created.date).toISOString().split('T')[0] : payload.date,
      tankName: newExpenseData.tankName || 'Tank',
    };
    setExpenses((prev) => [normalized, ...prev]);
    return normalized;
  };

  const updateExpense = async (id, updatedData) => {
    const payload = {
      ...(updatedData.category ? { category: updatedData.category } : {}),
      ...(updatedData.description ? { description: updatedData.description } : {}),
      ...(updatedData.amount ? { amount: parseFloat(updatedData.amount) } : {}),
      ...(updatedData.paymentMode ? { paymentMode: mapPaymentModeToApi(updatedData.paymentMode) } : {}),
      ...(updatedData.date ? { date: updatedData.date } : {}),
      ...(updatedData.notes !== undefined ? { notes: updatedData.notes } : {}),
    };

    console.log('[ExpenseContext] Updating expense #' + id + ' with payload:', payload);
    const res = await expenseService.updateExpense(id, payload);
    const updated = res.data || res;
    const normalized = {
      ...updated,
      date: updated.date ? new Date(updated.date).toISOString().split('T')[0] : updatedData.date,
      tankName: updated.crop?.tank?.tankName || 'Tank',
    };
    setExpenses((prev) => prev.map((item) => (item.id === id ? { ...item, ...normalized } : item)));
    return normalized;
  };

  const deleteExpense = async (id) => {
    await expenseService.deleteExpense(id);
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const getExpenseById = (id) => {
    return expenses.find((item) => item.id === id);
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        loading,
        error,
        fetchExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        getExpenseById,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

export default ExpenseContext;
