import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import expenseService from '../services/expenseService';
import { useAuth } from './AuthContext';
import { emitDataMutation, subscribeToSyncBus } from '../utils/syncBus';

const ExpenseContext = createContext(null);

export const ExpenseProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async (isSilent = false) => {
    if (!isAuthenticated) {
      setExpenses([]);
      return;
    }
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await expenseService.getExpenses();
      const list = res.data || res || [];
      const normalized = (Array.isArray(list) ? list : []).map((item) => ({
        ...item,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : item.date,
        tankName: item.crop?.tank?.tankName || item.tankName || 'Tank',
      }));
      setExpenses(normalized);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses, token]);

  // Subscribe to sync bus events for cascading cleanup & re-fetch
  useEffect(() => {
    const unsubscribe = subscribeToSyncBus((detail) => {
      if (detail.action === 'DELETE') {
        if (detail.entityType === 'TANK' && detail.payload?.tankId) {
          setExpenses((prev) => prev.filter((exp) => String(exp.tankId) !== String(detail.payload.tankId)));
        } else if (detail.entityType === 'CROP' && detail.payload?.cropId) {
          setExpenses((prev) => prev.filter((exp) => String(exp.cropId) !== String(detail.payload.cropId)));
        }
        fetchExpenses(true);
      } else if (['SITE', 'TANK', 'CROP', 'EXPENSE'].includes(detail.entityType)) {
        fetchExpenses(true);
      }
    });
    return unsubscribe;
  }, [fetchExpenses]);

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

    const res = await expenseService.createExpense(payload);
    const created = res.data || res;
    const normalized = {
      ...created,
      date: created.date ? new Date(created.date).toISOString().split('T')[0] : payload.date,
      tankName: newExpenseData.tankName || 'Tank',
    };
    setExpenses((prev) => [normalized, ...prev]);
    emitDataMutation('EXPENSE', 'CREATE', normalized);
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

    const res = await expenseService.updateExpense(id, payload);
    const updated = res.data || res;
    const normalized = {
      ...updated,
      date: updated.date ? new Date(updated.date).toISOString().split('T')[0] : updatedData.date,
      tankName: updated.crop?.tank?.tankName || 'Tank',
    };
    setExpenses((prev) => prev.map((item) => (String(item.id) === String(id) ? { ...item, ...normalized } : item)));
    emitDataMutation('EXPENSE', 'UPDATE', normalized);
    return normalized;
  };

  const deleteExpense = async (id) => {
    if (!id) return;
    try {
      await expenseService.deleteExpense(id);
    } catch (err) {
      console.warn('Backend expense delete notice:', err.message);
    }
    setExpenses((prev) => prev.filter((item) => String(item.id) !== String(id)));
    emitDataMutation('EXPENSE', 'DELETE', { id: String(id) });
  };

  const getExpenseById = (id) => {
    return expenses.find((item) => String(item.id) === String(id));
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
