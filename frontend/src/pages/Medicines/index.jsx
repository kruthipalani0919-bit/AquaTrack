import React, { useState, useMemo, useEffect } from 'react';
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
import { EmptyState } from '../../components/EmptyState';

import { MedicineCard } from '../../components/MedicineCard';
import { MedicineForm } from '../../components/MedicineForm';
import { MedicineFilters } from '../../components/MedicineFilters';
import { MedicineDetailsModal } from '../../components/MedicineDetailsModal';
import { useMedicine } from '../../context/MedicineContext';
import { useTanks } from '../../context/TankContext';
import { subscribeToSyncBus } from '../../utils/syncBus';

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

  const { tanks = [] } = useTanks();

  // Filter State (Tank & Date filters retained)
  const [tankFilter, setTankFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modal Control States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);

  // Reset tankFilter automatically if selected tank was deleted
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
        if (detail.entityType === 'MEDICINE' && detail.payload?.id) {
          const mId = String(detail.payload.id);
          if (viewingRecord && String(viewingRecord.id) === mId) {
            setIsDetailsOpen(false);
            setViewingRecord(null);
          }
          if (deletingRecord && String(deletingRecord.id) === mId) {
            setIsDeleteOpen(false);
            setDeletingRecord(null);
          }
          if (editingRecord && String(editingRecord.id) === mId) {
            setIsFormOpen(false);
            setEditingRecord(null);
          }
        }
      }
    });
    return unsubscribe;
  }, [tankFilter, viewingRecord, deletingRecord, editingRecord]);

  const safeAnalytics = {
    totalTreatments: analytics?.totalTreatments || (medicineRecords || []).length,
    totalMedicineCostRupees: analytics?.totalMedicineCostRupees || (medicineRecords || []).reduce((acc, r) => acc + (parseFloat(r.cost) || 0), 0),
  };

  // Filter Logic (Tank & Date matching)
  const filteredRecords = useMemo(() => {
    const list = medicineRecords || [];

    return list.filter((rec) => {
      if (!rec) return false;
      const matchesTank = tankFilter === '' || String(rec.tankId) === String(tankFilter);
      const matchesDate = dateFilter === '' || rec.applicationDate === dateFilter || rec.date === dateFilter;

      return matchesTank && matchesDate;
    });
  }, [medicineRecords, tankFilter, dateFilter]);

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
    setTankFilter('');
    setDateFilter('');
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Medicine Management"
        subtitle="Record health treatments, monitor dosages, and track chemical expenditure."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
            className="font-semibold shadow-xs"
          >
            Record Treatment Log
          </Button>
        }
      />

      {/* 2. MEDICINE SUMMARY ANALYTICS CARDS */}
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
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Medicine Cost</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">₹{safeAnalytics.totalMedicineCostRupees.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. MEDICINE FILTERS BAR */}
      <MedicineFilters
        tankFilter={tankFilter}
        onTankFilterChange={setTankFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onResetFilters={handleResetFilters}
      />

      {/* 4. MEDICINE RECORDS GRID OR EMPTY STATE */}
      {loading ? (
        <div className="py-16 text-center">
          <span className="text-xs font-semibold text-text-secondary">Loading medicine records...</span>
        </div>
      ) : filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredRecords.map((rec) => (
            <MedicineCard
              key={rec.id}
              record={rec}
              onViewDetails={() => handleOpenDetails(rec)}
              onEdit={() => handleOpenEdit(rec)}
              onDelete={() => handleOpenDelete(rec)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={tankFilter || dateFilter ? "No matching medicine records" : "No medicine logs recorded"}
          description={
            tankFilter || dateFilter
              ? "Try clearing your tank or date filter to view other treatment records."
              : "Record pond treatments and water chemicals to maintain health logs and cost records."
          }
          actionLabel={tankFilter || dateFilter ? "Reset Filters" : "Record Treatment Log"}
          onAction={tankFilter || dateFilter ? handleResetFilters : handleOpenAdd}
        />
      )}

      {/* 5. ADD / EDIT MEDICINE FORM MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingRecord ? "Edit Medicine Record" : "Record Treatment Log"}
        maxWidth="max-w-md"
      >
        <MedicineForm
          initialData={editingRecord}
          onSubmit={handleSaveRecord}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* 6. VIEW MEDICINE DETAILS MODAL */}
      {viewingRecord && (
        <MedicineDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          record={viewingRecord}
          onEdit={() => handleOpenEdit(viewingRecord)}
        />
      )}

      {/* 7. DELETE MEDICINE RECORD CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Medicine Record"
        message={`Are you sure you want to delete treatment record for "${deletingRecord?.medicineName || 'Medicine'}"? This action cannot be undone.`}
        confirmText="Delete Record"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
