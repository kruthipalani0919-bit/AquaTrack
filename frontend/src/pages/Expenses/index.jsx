import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Receipt, IndianRupee, FileText, Landmark } from 'lucide-react';

import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { EmptyState } from '../../components/EmptyState';

import { ExpenseCard } from '../../components/ExpenseCard';
import { ExpenseForm } from '../../components/ExpenseForm';
import { ExpenseFilters } from '../../components/ExpenseFilters';
import { ExpenseDetailsModal } from '../../components/ExpenseDetailsModal';
import { useExpenses } from '../../context/ExpenseContext';
import { useTanks } from '../../context/TankContext';
import { subscribeToSyncBus } from '../../utils/syncBus';

export default function Expenses() {
  const navigate = useNavigate();
  const { expenses = [], addExpense, updateExpense, deleteExpense, loading, error } = useExpenses();
  const { tanks = [] } = useTanks();

  // Filter State (Category & Tank filters retained)
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tankFilter, setTankFilter] = useState('');

  // Modal Controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingExpense, setViewingExpense] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState(null);

  // Automatically reset tankFilter if the selected tank was deleted
  useEffect(() => {
    if (tankFilter && tanks.length > 0) {
      const exists = tanks.some((t) => String(t.id) === String(tankFilter));
      if (!exists) {
        setTankFilter('');
      }
    }
  }, [tanks, tankFilter]);

  // Subscribe to sync bus events for reactive modal cleanup
  useEffect(() => {
    const unsubscribe = subscribeToSyncBus((detail) => {
      if (detail.action === 'DELETE') {
        if (detail.entityType === 'TANK' && detail.payload?.tankId === tankFilter) {
          setTankFilter('');
        }
        if (detail.entityType === 'EXPENSE' && detail.payload?.id) {
          const eId = String(detail.payload.id);
          if (viewingExpense && String(viewingExpense.id) === eId) {
            setIsDetailsOpen(false);
            setViewingExpense(null);
          }
          if (deletingExpense && String(deletingExpense.id) === eId) {
            setIsDeleteOpen(false);
            setDeletingExpense(null);
          }
          if (editingExpense && String(editingExpense.id) === eId) {
            setIsFormOpen(false);
            setEditingExpense(null);
          }
        }
      }
    });
    return unsubscribe;
  }, [tankFilter, viewingExpense, deletingExpense, editingExpense]);

  // Filter Expenses List Safely
  const filteredExpenses = useMemo(() => {
    const list = expenses || [];

    return list.filter((exp) => {
      if (!exp) return false;
      const matchesCategory = categoryFilter === '' || exp.category === categoryFilter;
      const matchesTank = tankFilter === '' || String(exp.tankId) === String(tankFilter);

      return matchesCategory && matchesTank;
    });
  }, [expenses, categoryFilter, tankFilter]);

  // Operational Metrics Summary (Total Expenses Amount & Total Records Count)
  const stats = useMemo(() => {
    const list = expenses || [];
    const totalCount = list.length;
    const totalAmount = list.reduce((acc, e) => acc + (parseFloat(e?.amount) || 0), 0);

    return {
      totalCount,
      totalAmount,
    };
  }, [expenses]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleOpenDetails = (expense) => {
    setViewingExpense(expense);
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = (expense) => {
    setDeletingExpense(expense);
    setIsDeleteOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleSaveExpense = async (formData) => {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, formData);
      } else {
        await addExpense(formData);
      }
      setIsFormOpen(false);
      setEditingExpense(null);
    } catch (err) {
      console.error('Error saving expense:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingExpense) {
      try {
        await deleteExpense(deletingExpense.id);
        setIsDeleteOpen(false);
        setDeletingExpense(null);
      } catch (err) {
        console.error('Error deleting expense:', err);
      }
    }
  };

  const handleResetFilters = () => {
    setCategoryFilter('');
    setTankFilter('');
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Expense Management"
        subtitle="Log general operational costs, pond prep, lab testing, electricity, and labor charges."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
            className="font-semibold shadow-xs"
          >
            Add Expense Log
          </Button>
        }
      />

      {/* 2. OPERATIONAL SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Expense Records</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{stats.totalCount}</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Expenditure</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">₹{stats.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. EXPENSE FILTERS BAR */}
      <ExpenseFilters
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        tankFilter={tankFilter}
        onTankFilterChange={setTankFilter}
        onResetFilters={handleResetFilters}
      />

      {/* 4. EXPENSES GRID OR EMPTY STATE */}
      {loading ? (
        <div className="py-16 text-center">
          <span className="text-xs font-semibold text-text-secondary">Loading operational expenses...</span>
        </div>
      ) : filteredExpenses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredExpenses.map((exp) => (
            <ExpenseCard
              key={exp.id}
              expense={exp}
              onViewDetails={() => handleOpenDetails(exp)}
              onEdit={() => handleOpenEdit(exp)}
              onDelete={() => handleOpenDelete(exp)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={categoryFilter || tankFilter ? "No matching expense records" : "No operational expenses logged"}
          description={
            categoryFilter || tankFilter
              ? "Try adjusting your category or tank filter."
              : "Log pond prep, electricity bills, labor charges, and testing expenses to track farm overheads."
          }
          actionLabel={categoryFilter || tankFilter ? "Reset Filters" : "Add Expense Log"}
          onAction={categoryFilter || tankFilter ? handleResetFilters : handleOpenAdd}
        />
      )}

      {/* 5. ADD / EDIT EXPENSE FORM MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingExpense ? "Edit Operational Expense" : "Log Operational Expense"}
        maxWidth="max-w-md"
      >
        <ExpenseForm
          initialData={editingExpense}
          onSubmit={handleSaveExpense}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* 6. VIEW EXPENSE DETAILS MODAL */}
      {viewingExpense && (
        <ExpenseDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          expense={viewingExpense}
          onEdit={() => handleOpenEdit(viewingExpense)}
        />
      )}

      {/* 7. DELETE EXPENSE CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Operational Expense"
        message={`Are you sure you want to delete expense "${deletingExpense?.category || deletingExpense?.description || 'Expense'}"? This action cannot be undone.`}
        confirmText="Delete Expense"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
