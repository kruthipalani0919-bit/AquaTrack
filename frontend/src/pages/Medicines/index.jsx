import React, { useState, useMemo } from 'react';
import {
  Plus,
  Stethoscope,
  CheckCircle2,
  IndianRupee
} from 'lucide-react';

import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { EmptyState } from '../../components/EmptyState';

import { MedicineCard } from '../../components/MedicineCard';
import { MedicineForm } from '../../components/MedicineForm';
import { MedicineFilters } from '../../components/MedicineFilters';
import { MedicineDetailsModal } from '../../components/MedicineDetailsModal';
import { useMedicine } from '../../context/MedicineContext';

export default function Medicines() {
  const {
    medicineRecords = [],
    addMedicineRecord,
    updateMedicineRecord,
    deleteMedicineRecord,
    analytics = { totalTreatments: 0, medicinesUsedToday: 0, totalMedicineCostRupees: 0 },
    loading,
    error
  } = useMedicine();

  // Search & Multi-Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tankFilter, setTankFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modal Control States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);

  const safeAnalytics = {
    totalTreatments: analytics?.totalTreatments || (medicineRecords || []).length,
    medicinesUsedToday: analytics?.medicinesUsedToday || 0,
    totalMedicineCostRupees: analytics?.totalMedicineCostRupees || (medicineRecords || []).reduce((acc, r) => acc + (parseFloat(r.cost) || 0), 0),
  };

  // Multi-Filter Logic Safely
  const filteredRecords = useMemo(() => {
    const list = medicineRecords || [];
    const query = (searchQuery || '').trim().toLowerCase();

    return list.filter((rec) => {
      if (!rec) return false;
      const medStr = rec.medicineName || '';
      const rawTank = rec.tankName || rec.tank?.name || rec.tank?.tankName || '';
      const tankStr = rawTank.replace(/\s*\([^)]*\)/g, '').trim();
      const notesStr = rec.notes || '';

      const matchesSearch =
        query === '' ||
        medStr.toLowerCase().includes(query) ||
        tankStr.toLowerCase().includes(query) ||
        notesStr.toLowerCase().includes(query);

      const matchesCategory = categoryFilter === '' || rec.category === categoryFilter;
      const matchesTank = tankFilter === '' || rec.tankId === tankFilter;
      const matchesDate = dateFilter === '' || rec.applicationDate === dateFilter || rec.date === dateFilter;

      return matchesSearch && matchesCategory && matchesTank && matchesDate;
    });
  }, [medicineRecords, searchQuery, categoryFilter, tankFilter, dateFilter]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setIsFormOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleOpenDetails = (rec) => {
    setViewingRecord(rec);
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = (rec) => {
    setDeletingRecord(rec);
    setIsDeleteOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleSaveRecord = async (formData) => {
    try {
      if (editingRecord) {
        await updateMedicineRecord(editingRecord.id, formData);
      } else {
        await addMedicineRecord(formData);
      }
      setIsFormOpen(false);
      setEditingRecord(null);
    } catch (err) {
      console.error('Error saving medicine record:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingRecord) {
      try {
        await deleteMedicineRecord(deletingRecord.id);
        setIsDeleteOpen(false);
        setDeletingRecord(null);
      } catch (err) {
        console.error('Error deleting medicine record:', err);
      }
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setTankFilter('');
    setDateFilter('');
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Medicine & Health Management"
        subtitle="Track pond treatments, probiotics, and treatment expenditure."
        badge={<Badge variant="primary">{(medicineRecords || []).length} Records</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
            className="font-semibold shadow-xs"
          >
            Add Treatment Record
          </Button>
        }
      />

      {/* 2. TOP DASHBOARD SUMMARY CARDS (Total Treatments, Used Today, Total Cost) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Total Treatments */}
        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Treatments</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{safeAnalytics.totalTreatments} Records</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Used Today */}
        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Used Today</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{safeAnalytics.medicinesUsedToday} Today</span>
            </div>
          </div>
        </Card>

        {/* Card 3: Total Cost */}
        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Cost</span>
              <span className="text-lg font-bold text-emerald-700 tracking-tight">
                ₹{safeAnalytics.totalMedicineCostRupees.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. SEARCH & FILTERS */}
      <MedicineFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        tankFilter={tankFilter}
        onTankChange={setTankFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        onReset={handleResetFilters}
      />

      {/* 4. MEDICINE CARDS GRID OR EMPTY STATE */}
      {filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredRecords.map((rec) => (
            <MedicineCard
              key={rec.id}
              record={rec}
              onView={handleOpenDetails}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        <Card padding="relaxed" className="border-border/80">
          <EmptyState
            title="No Treatment Records Found"
            description={
              searchQuery || categoryFilter || tankFilter || dateFilter
                ? "No medicine logs match your current filter selection. Try clearing filters or resetting search."
                : "You haven't logged any medicine or probiotic applications yet. Click the button below to add your first treatment record."
            }
            actionLabel={
              searchQuery || categoryFilter || tankFilter || dateFilter ? "Reset Filters" : "Add Treatment Record"
            }
            onAction={
              searchQuery || categoryFilter || tankFilter || dateFilter ? handleResetFilters : handleOpenAdd
            }
          />
        </Card>
      )}

      {/* 5. ADD / EDIT MEDICINE LOG MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRecord(null);
        }}
        title={editingRecord ? 'Edit Treatment Record' : 'Add New Treatment Record'}
        description={
          editingRecord
            ? `Update details for ${editingRecord.medicineName || 'Treatment'}`
            : 'Record a medicine or probiotic application for a farm tank.'
        }
        size="md"
      >
        <MedicineForm
          initialData={editingRecord}
          onSubmit={handleSaveRecord}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingRecord(null);
          }}
        />
      </Modal>

      {/* 6. VIEW MEDICINE LOG MODAL */}
      <MedicineDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setViewingRecord(null);
        }}
        record={viewingRecord}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* 7. DELETE CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingRecord(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Treatment Record"
        message={
          deletingRecord
            ? `Are you sure you want to delete treatment record for "${deletingRecord.medicineName || 'Treatment'}"? This action cannot be undone.`
            : 'Are you sure you want to delete this treatment record?'
        }
        confirmText="Delete Treatment Record"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
