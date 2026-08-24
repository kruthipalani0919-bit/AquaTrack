import React, { useState, useMemo } from 'react';
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

export default function Expenses() {
  const navigate = useNavigate();
  const { expenses = [], addExpense, updateExpense, deleteExpense, loading, error } = useExpenses();

  // Filter State (Category & Tank filters retained)
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tankFilter, setTankFilter] = useState('');

  // Modal Control States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingExpense, setViewingExpense] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter Expenses List Safely
  const filteredExpenses = useMemo(() => {
    const list = expenses || [];

    return list.filter((exp) => {
      if (!exp) return false;
      const matchesCategory = categoryFilter === '' || exp.category === categoryFilter;
      const matchesTank = tankFilter === '' || exp.tankId === tankFilter;

      return matchesCategory && matchesTank;
    });
  }, [expenses, categoryFilter, tankFilter]);

  // Operational Metrics Summary (Total Expenses Amount & Total Records Count)
  const stats = useMemo(() => {
    const list = expenses || [];
    const totalAmount = list.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const totalRecords = list.length;

    return {
      totalAmount,
      totalRecords,
    };
  }, [expenses]);

  // Form Handlers
  const handleOpenAdd = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setIsFormOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleOpenDetails = (exp) => {
    setViewingExpense(exp);
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = (exp) => {
    setDeletingExpense(exp);
    setIsDeleteOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleSaveExpense = async (formData) => {
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingExpense) {
      setIsDeleting(true);
      try {
        await deleteExpense(deletingExpense.id);
        setIsDeleteOpen(false);
        setDeletingExpense(null);
      } catch (err) {
        console.error('Error deleting expense:', err);
      } finally {
        setIsDeleting(false);
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
        subtitle="Log and monitor operating expenses, feed costs, electricity, labour, and maintenance."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/pond-lease')}
              icon={<Landmark className="w-4 h-4" />}
              className="font-semibold shadow-xs"
            >
              Pond Lease Management
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
              icon={<Plus className="w-4 h-4" />}
              className="font-semibold shadow-xs"
            >
              Add New Expense
            </Button>
          </div>
        }
      />

      {/* 2. SUMMARY CARDS (Total Expenses & Total Records) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card padding="compact" className="border-border/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Expenses</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">₹{stats.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Records</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{stats.totalCount}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. FILTERS AREA (Select Category & Select Tank) */}
      <ExpenseFilters
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        tankFilter={tankFilter}
        onTankChange={setTankFilter}
        onReset={handleResetFilters}
      />

      {/* 4. EXPENSE CARDS GRID OR EMPTY STATE */}
      {filteredExpenses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredExpenses.map((exp) => (
            <ExpenseCard
              key={exp.id}
              expense={exp}
              onViewDetails={handleOpenDetails}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        <Card padding="relaxed" className="border-border/80 shadow-2xs">
          <EmptyState
            title="No Expenses Recorded"
            description={
              categoryFilter || tankFilter
                ? "No expense records match your selected filter criteria. Try resetting filters."
                : "Log farm operating expenses to track overall production expenditure."
            }
            actionLabel={
              categoryFilter || tankFilter ? "Reset Filters" : "Add New Expense"
            }
            onAction={
              categoryFilter || tankFilter ? handleResetFilters : handleOpenAdd
            }
          />
        </Card>
      )}

      {/* 5. ADD / EDIT EXPENSE MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingExpense(null);
        }}
        title={editingExpense ? 'Edit Expense Record' : 'Add New Expense'}
        description={
          editingExpense
            ? `Update expense record for ${editingExpense.category || 'Expense'}`
            : 'Record a new operating expenditure for your farm ponds.'
        }
        size="md"
      >
        <ExpenseForm
          initialData={editingExpense}
          onSubmit={handleSaveExpense}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingExpense(null);
          }}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* 6. VIEW EXPENSE DETAILS MODAL */}
      <ExpenseDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setViewingExpense(null);
        }}
        expense={viewingExpense}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* 7. DELETE CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingExpense(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Expense Record"
        message={
          deletingExpense
            ? `Are you sure you want to delete the expense record for "${deletingExpense.category || 'Expense'}"? This action cannot be undone.`
            : 'Are you sure you want to delete this expense record?'
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete Expense Record'}
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
