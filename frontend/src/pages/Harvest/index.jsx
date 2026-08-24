import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Fish, Weight, IndianRupee, AlertCircle } from 'lucide-react';

import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { EmptyState } from '../../components/EmptyState';

import { HarvestCard } from '../../components/HarvestCard';
import { HarvestForm } from '../../components/HarvestForm';
import { HarvestFilters } from '../../components/HarvestFilters';
import { HarvestDetailsModal } from '../../components/HarvestDetailsModal';
import { useHarvests } from '../../context/HarvestContext';
import { useTanks } from '../../context/TankContext';
import { subscribeToSyncBus } from '../../utils/syncBus';

export default function Harvest() {
  const { harvests = [], addHarvest, updateHarvest, deleteHarvest, loading, error: contextError } = useHarvests();
  const { tanks = [] } = useTanks();

  // Filter State
  const [tankFilter, setTankFilter] = useState('');

  // Explicit, Isolated State for Viewing, Editing, and Deleting
  const [viewingHarvest, setViewingHarvest] = useState(null);
  const [editingHarvest, setEditingHarvest] = useState(null);
  const [deletingHarvest, setDeletingHarvest] = useState(null);

  // Modal Control States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form & Action Loading & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteError, setDeleteError] = useState('');

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
        if (detail.entityType === 'HARVEST' && detail.payload?.id) {
          const hId = String(detail.payload.id);
          if (viewingHarvest && String(viewingHarvest.id) === hId) {
            setIsDetailsOpen(false);
            setViewingHarvest(null);
          }
          if (deletingHarvest && String(deletingHarvest.id) === hId) {
            setIsDeleteOpen(false);
            setDeletingHarvest(null);
          }
          if (editingHarvest && String(editingHarvest.id) === hId) {
            setIsFormOpen(false);
            setEditingHarvest(null);
          }
        }
      }
    });
    return unsubscribe;
  }, [tankFilter, viewingHarvest, deletingHarvest, editingHarvest]);

  // Filter Harvest List Safely
  const filteredHarvests = useMemo(() => {
    const list = harvests || [];

    return list.filter((harv) => {
      if (!harv) return false;
      const targetTankId = harv.tankId || harv.tank?.id || harv.crop?.tankId;
      return tankFilter === '' || String(targetTankId) === String(tankFilter);
    });
  }, [harvests, tankFilter]);

  // Operational Metrics Summary Safely
  const stats = useMemo(() => {
    const list = harvests || [];
    const totalCount = list.length;
    const totalShrimpCount = list.reduce((acc, h) => acc + (parseFloat(h?.shrimpCount) || 0), 0);
    const avgAbwGrams = totalCount > 0
      ? (list.reduce((acc, h) => acc + (parseFloat(h?.averageWeight) || 0), 0) / totalCount).toFixed(1)
      : 0;
    const avgPricePerKg = totalCount > 0
      ? (list.reduce((acc, h) => acc + (parseFloat(h?.sellingPrice) || 0), 0) / totalCount).toFixed(0)
      : 0;

    return {
      totalCount,
      totalShrimpCount,
      avgAbwGrams,
      avgPricePerKg,
    };
  }, [harvests]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingHarvest(null);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (harvest) => {
    if (!harvest || !harvest.id) return;
    setEditingHarvest({ ...harvest });
    setFormError('');
    setIsFormOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleOpenDetails = (harvest) => {
    if (!harvest || !harvest.id) return;
    setViewingHarvest({ ...harvest });
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = (harvest) => {
    if (!harvest || !harvest.id) return;
    setDeletingHarvest({ ...harvest });
    setDeleteError('');
    setIsDeleteOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  // Connected submit handler for Add & Update Harvest
  const handleSaveHarvest = async (formData) => {
    setIsSubmitting(true);
    setFormError('');
    try {
      if (editingHarvest && editingHarvest.id) {
        await updateHarvest(editingHarvest.id, formData);
      } else {
        await addHarvest(formData);
      }
      setIsFormOpen(false);
      setEditingHarvest(null);
    } catch (err) {
      console.error('Error saving harvest record:', err);
      setFormError(err.message || 'Failed to save harvest details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guaranteed Delete Handler
  const handleConfirmDelete = async () => {
    if (!deletingHarvest || !deletingHarvest.id) {
      setIsDeleteOpen(false);
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      await deleteHarvest(deletingHarvest.id);
      setIsDeleteOpen(false);
      setDeletingHarvest(null);
    } catch (err) {
      console.error('Error deleting harvest record:', err);
      setDeleteError(err.message || 'Failed to delete harvest record.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setTankFilter('');
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Harvest Management"
        subtitle="Record final harvest yield, buyer sales contracts, average body weight, and net revenue."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
            className="font-semibold shadow-xs cursor-pointer"
          >
            Register New Harvest
          </Button>
        }
      />

      {/* 2. OPERATIONAL SUMMARY METRICS (4 Summary Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Fish className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Harvests</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{stats.totalCount}</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Weight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Shrimp Count</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{stats.totalShrimpCount.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Weight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Average ABW</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{stats.avgAbwGrams} g</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Avg Selling Price</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">₹{Number(stats.avgPricePerKg).toLocaleString()} / kg</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. HARVEST FILTERS BAR */}
      <HarvestFilters
        tankFilter={tankFilter}
        onTankFilterChange={setTankFilter}
        onResetFilters={handleResetFilters}
      />

      {/* 4. HARVEST RECORDS GRID OR EMPTY STATE */}
      {loading ? (
        <div className="py-16 text-center">
          <span className="text-xs font-semibold text-text-secondary">Loading harvest records...</span>
        </div>
      ) : filteredHarvests.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredHarvests.map((harvest) => (
            <HarvestCard
              key={harvest.id}
              harvest={harvest}
              onViewDetails={() => handleOpenDetails(harvest)}
              onEdit={() => handleOpenEdit(harvest)}
              onDelete={() => handleOpenDelete(harvest)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={tankFilter ? "No matching harvest records" : "No harvests registered yet"}
          description={
            tankFilter
              ? "Try resetting the tank filter to view harvests from other tanks."
              : "Register completed crop harvests to track final yield weights, buyer sales contracts, and revenue analytics."
          }
          actionLabel={tankFilter ? "Reset Filter" : "Register New Harvest"}
          onAction={tankFilter ? handleResetFilters : handleOpenAdd}
        />
      )}

      {/* 5. ADD / EDIT HARVEST FORM MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingHarvest ? "Edit Harvest Record" : "Register New Harvest"}
        maxWidth="max-w-xl"
      >
        {formError && (
          <div className="mb-4 p-3 bg-danger-light text-danger rounded-lg text-xs font-medium border border-danger/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}
        <HarvestForm
          initialData={editingHarvest}
          onSubmit={handleSaveHarvest}
          onCancel={() => setIsFormOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* 6. VIEW HARVEST DETAILS MODAL */}
      {viewingHarvest && (
        <HarvestDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          harvest={viewingHarvest}
          onEdit={() => handleOpenEdit(viewingHarvest)}
        />
      )}

      {/* 7. DELETE HARVEST CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Harvest Record"
        message={`Are you sure you want to delete harvest record for "${deletingHarvest?.tankName || deletingHarvest?.cropName || 'Batch'}"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete Harvest"}
        cancelText="Cancel"
        variant="danger"
        disabled={isDeleting}
      />
    </div>
  );
}
