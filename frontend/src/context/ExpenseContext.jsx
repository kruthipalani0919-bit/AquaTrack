import React, { createContext, useContext, useState } from 'react';
import { MOCK_EXPENSES } from '../constants/expenseData';

const ExpenseContext = createContext(null);

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState(MOCK_EXPENSES);

  const addExpense = (newExpenseData) => {
    const newExpense = {
      id: `exp-${Date.now()}`,
      tankId: newExpenseData.tankId,
      tankName: newExpenseData.tankName || 'Tank 1',
      category: newExpenseData.category,
      description: newExpenseData.description,
      amount: parseFloat(newExpenseData.amount) || 0,
      paymentMode: newExpenseData.paymentMode,
      date: newExpenseData.date,
      notes: newExpenseData.notes || '',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setExpenses((prev) => [newExpense, ...prev]);
    return newExpense;
  };

  const updateExpense = (id, updatedData) => {
    setExpenses((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            ...updatedData,
            amount: parseFloat(updatedData.amount) || 0,
          };
        }
        return item;
      })
    );
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const getExpenseById = (id) => {
    return expenses.find((item) => item.id === id);
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
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
