import React, { useState, useMemo } from 'react';
import { Plus, Receipt, IndianRupee, Zap, UtensilsCrossed } from 'lucide-react';

import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { EmptyState } from '../../components/EmptyState';

import { ExpenseCard } from '../../components/ExpenseCard';
import { ExpenseForm } from '../../components/ExpenseForm';
import { ExpenseFilters } from '../../components/ExpenseFilters';
import { ExpenseDetailsModal } from '../../components/ExpenseDetailsModal';
import { useExpenses } from '../../context/ExpenseContext';

export default function Expenses() {
  const { expenses = [], addExpense, updateExpense, deleteExpense, loading, error } = useExpenses();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tankFilter, setTankFilter] = useState('');

  // Modal Controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingExpense, setViewingExpense] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState(null);

  // Filter Expenses List Safely
  const filteredExpenses = useMemo(() => {
    const list = expenses || [];
    const query = (searchQuery || '').trim().toLowerCase();

    return list.filter((exp) => {
      if (!exp) return false;
      const descStr = exp.description || '';
      const catStr = exp.category || '';
      const notesStr = exp.notes || '';

      const matchesSearch =
        query === '' ||
        descStr.toLowerCase().includes(query) ||
        catStr.toLowerCase().includes(query) ||
        notesStr.toLowerCase().includes(query);

      const matchesCategory = categoryFilter === '' || exp.category === categoryFilter;
      const matchesTank = tankFilter === '' || exp.tankId === tankFilter;

      return matchesSearch && matchesCategory && matchesTank;
    });
  }, [expenses, searchQuery, categoryFilter, tankFilter]);

  // Operational Metrics Summary Safely
  const stats = useMemo(() => {
    const list = expenses || [];
    const totalCount = list.length;
    const totalAmount = list.reduce((acc, e) => acc + (parseFloat(e?.amount) || 0), 0);
    const feedAmount = list
      .filter((e) => e?.category === 'Feed')
      .reduce((acc, e) => acc + (parseFloat(e?.amount) || 0), 0);
    const powerAmount = list
      .filter((e) => e?.category === 'Electricity' || e?.category === 'Generator & Diesel')
      .reduce((acc, e) => acc + (parseFloat(e?.amount) || 0), 0);

    return {
      totalCount,
      totalAmount,
      feedAmount,
      powerAmount,
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
    setSearchQuery('');
    setCategoryFilter('');
    setTankFilter('');
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Expense Management"
        subtitle="Log and monitor operating expenses, feed costs, electricity, labour, and maintenance."
        badge={<Badge variant="primary">{stats.totalCount} Expenses</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
            className="font-semibold shadow-xs"
          >
            Add New Expense
          </Button>
        }
      />

      {/* 2. OPERATIONAL METRICS SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Expenses</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">₹{stats.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Feed Expenses</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">₹{stats.feedAmount.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Power & Fuel</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">₹{stats.powerAmount.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Records</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{stats.totalCount} Logs</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. FILTERS */}
      <ExpenseFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        tankFilter={tankFilter}
        onTankChange={setTankFilter}
        onReset={handleResetFilters}
      />

      {/* 4. EXPENSES GRID OR EMPTY STATE */}
      {filteredExpenses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onView={handleOpenDetails}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        <Card padding="relaxed" className="border-border/80">
          <EmptyState
            title="No Expenses Found"
            description={
              searchQuery || categoryFilter || tankFilter
                ? "No expense records match your filter criteria. Try clearing filters."
                : "You haven't logged any farm expenses yet. Click below to add your first record."
            }
            actionLabel={
              searchQuery || categoryFilter || tankFilter ? "Reset Filters" : "Add First Expense"
            }
            onAction={
              searchQuery || categoryFilter || tankFilter ? handleResetFilters : handleOpenAdd
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
            ? `Update expense details for ${editingExpense.description || 'Expense'}`
            : 'Log a new farm operational expense or input cost.'
        }
        size="lg"
      >
        <ExpenseForm
          initialData={editingExpense}
          onSubmit={handleSaveExpense}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingExpense(null);
          }}
        />
      </Modal>

      {/* 6. EXPENSE DETAILS MODAL */}
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
            ? `Are you sure you want to delete "${deletingExpense.description || 'Expense'}"? This action cannot be undone.`
            : 'Are you sure you want to delete this expense record?'
        }
        confirmText="Delete Expense"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
