import React, { useState, useMemo } from 'react';
import {
  Plus,
  Stethoscope,
  IndianRupee
} from 'lucide-react';

import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { PasswordConfirmationModal } from '../../components/PasswordConfirmationModal';
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

  // Filter State (Tank & Date filters retained)
  const [tankFilter, setTankFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modal Control States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);

  const safeAnalytics = {
    totalTreatments: analytics?.totalTreatments || (medicineRecords || []).length,
    totalMedicineCostRupees: analytics?.totalMedicineCostRupees || (medicineRecords || []).reduce((acc, r) => acc + (parseFloat(r.cost) || 0), 0),
  };

  // Filter Medicine Records
  const filteredRecords = useMemo(() => {
    const list = medicineRecords || [];
    return list.filter((record) => {
      if (!record) return false;
      const matchesTank = tankFilter === '' || record.tankId === tankFilter;

      let matchesDate = true;
      if (dateFilter) {
        const recordDateStr = record.date ? new Date(record.date).toISOString().split('T')[0] : '';
        matchesDate = recordDateStr === dateFilter;
      }

      return matchesTank && matchesDate;
    });
  }, [medicineRecords, tankFilter, dateFilter]);

  // Form Handlers
  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    setFormError('');
    setIsFormOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleOpenDetails = (record) => {
    setViewingRecord(record);
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = (record) => {
    setDeletingRecord(record);
    setIsDeleteOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleSaveRecord = async (formData) => {
    setIsSubmitting(true);
    setFormError('');
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
      const rawMsg = err.message || '';
      if (rawMsg.toLowerCase().includes('insufficient medicine stock')) {
        setFormError('Treatment could not be recorded because the requested quantity exceeds the available site stock.');
      } else {
        setFormError(rawMsg || 'Failed to save treatment record.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptDeleteStep1 = () => {
    setIsDeleteOpen(false);
    setIsPasswordOpen(true);
  };

  const handleFinalDeleteWithPassword = async (password) => {
    if (deletingRecord) {
      await deleteMedicineRecord(deletingRecord.id, password);
      setIsPasswordOpen(false);
      setDeletingRecord(null);
    }
  };

  const handleResetFilters = () => {
    setTankFilter('');
    setDateFilter('');
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Medicine & Health Management"
        subtitle="Track pond treatments, probiotics, and treatment expenditure."
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

      {/* 2. TOP SUMMARY CARDS (Total Treatments, Total Cost) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Treatments</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{safeAnalytics.totalTreatments}</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Cost</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">₹{safeAnalytics.totalMedicineCostRupees.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. FILTERS AREA (All Tanks & Date Picker) */}
      <MedicineFilters
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
              onViewDetails={handleOpenDetails}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        <Card padding="relaxed" className="border-border/80 shadow-2xs">
          <EmptyState
            title="No Treatment Records Found"
            description={
              tankFilter || dateFilter
                ? "No treatment records match your current filter criteria. Try resetting filters."
                : "No treatment records registered yet."
            }
            actionLabel={
              tankFilter || dateFilter ? "Reset Filters" : "Add Treatment Record"
            }
            onAction={
              tankFilter || dateFilter ? handleResetFilters : handleOpenAdd
            }
          />
        </Card>
      )}

      {/* 5. ADD / EDIT MEDICINE RECORD MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRecord(null);
        }}
        title={editingRecord ? 'Edit Treatment Record' : 'Add Treatment Record'}
        description={
          editingRecord
            ? `Update details for ${editingRecord.medicineName || 'Treatment'}`
            : 'Register a new medicine or chemical treatment into a farm tank.'
        }
        size="md"
      >
        <MedicineForm
          initialData={editingRecord}
          onSubmit={handleSaveRecord}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingRecord(null);
            setFormError('');
          }}
          isSubmitting={isSubmitting}
          formError={formError}
        />
      </Modal>

      {/* 6. VIEW MEDICINE DETAILS MODAL */}
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

      {/* 7. DELETE CONFIRMATION DIALOG (Step 1) */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingRecord(null);
        }}
        onConfirm={handleAcceptDeleteStep1}
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

      {/* 8. PASSWORD CONFIRMATION MODAL (Step 2) */}
      <PasswordConfirmationModal
        isOpen={isPasswordOpen}
        onClose={() => {
          setIsPasswordOpen(false);
          setDeletingRecord(null);
        }}
        onConfirm={handleFinalDeleteWithPassword}
      />
    </div>
  );
}
