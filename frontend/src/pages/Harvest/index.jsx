import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';

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

export default function Harvest() {
  const { harvests = [], addHarvest, updateHarvest, deleteHarvest, loading, error } = useHarvests();

  // Filter State
  const [tankFilter, setTankFilter] = useState('');

  // Modal Control States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingHarvest, setViewingHarvest] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingHarvest, setDeletingHarvest] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter Harvest List Safely
  const filteredHarvests = useMemo(() => {
    const list = harvests || [];

    return list.filter((harv) => {
      if (!harv) return false;
      if (!tankFilter) return true;

      const harvTankId = String(harv.tankId || harv.crop?.tankId || harv.crop?.tank?.id || '');
      const harvTankName = String(harv.tankName || harv.crop?.tank?.tankName || harv.crop?.tank?.name || '').toLowerCase();
      const filterVal = String(tankFilter).toLowerCase();

      return harvTankId === String(tankFilter) || harvTankName === filterVal || harvTankName.includes(filterVal);
    });
  }, [harvests, tankFilter]);

  // Form Handlers
  const handleOpenAdd = () => {
    setEditingHarvest(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (harvest) => {
    setEditingHarvest(harvest);
    setIsFormOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleOpenDetails = (harvest) => {
    setViewingHarvest(harvest);
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = (harvest) => {
    setDeletingHarvest(harvest);
    setIsDeleteOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleSaveHarvest = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingHarvest) {
        await updateHarvest(editingHarvest.id, formData);
      } else {
        await addHarvest(formData);
      }
      setIsFormOpen(false);
      setEditingHarvest(null);
    } catch (err) {
      console.error('Error saving harvest:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingHarvest) {
      setIsDeleting(true);
      try {
        await deleteHarvest(deletingHarvest.id);
        setIsDeleteOpen(false);
        setDeletingHarvest(null);
      } catch (err) {
        console.error('Error deleting harvest:', err);
      } finally {
        setIsDeleting(false);
      }
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
        subtitle="Log pond harvest yields, harvest weights (kg), selling prices, and buyer details."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
            className="font-semibold shadow-xs"
          >
            Register New Harvest
          </Button>
        }
      />

      {/* 2. FILTERS AREA (Select Tank Dropdown) */}
      <HarvestFilters
        tankFilter={tankFilter}
        onTankChange={setTankFilter}
        onReset={handleResetFilters}
      />

      {/* 4. HARVEST CARDS GRID OR EMPTY STATE */}
      {filteredHarvests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredHarvests.map((harv) => (
            <HarvestCard
              key={harv.id}
              harvest={harv}
              onViewDetails={handleOpenDetails}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        <Card padding="relaxed" className="border-border/80 shadow-2xs">
          <EmptyState
            title="No Harvest Logs Found"
            description={
              tankFilter
                ? "No harvest logs match your selected tank filter. Try resetting filters."
                : "Register pond harvest yields to track production revenue."
            }
            actionLabel={
              tankFilter ? "Reset Filters" : "Register New Harvest"
            }
            onAction={
              tankFilter ? handleResetFilters : handleOpenAdd
            }
          />
        </Card>
      )}

      {/* 5. ADD / EDIT HARVEST MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingHarvest(null);
        }}
        title={editingHarvest ? 'Edit Harvest Record' : 'Register New Harvest'}
        description={
          editingHarvest
            ? `Update harvest details for ${editingHarvest.buyerName || 'Harvest'}`
            : 'Register a new harvest log with buyer details and count.'
        }
        size="md"
      >
        <HarvestForm
          initialData={editingHarvest}
          onSubmit={handleSaveHarvest}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingHarvest(null);
          }}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* 6. VIEW HARVEST DETAILS MODAL */}
      <HarvestDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setViewingHarvest(null);
        }}
        harvest={viewingHarvest}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* 7. DELETE CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingHarvest(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Harvest Record"
        message={
          deletingHarvest
            ? `Are you sure you want to delete the harvest record for "${deletingHarvest.buyerName || 'Harvest'}"? This action cannot be undone.`
            : 'Are you sure you want to delete this harvest record?'
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete Harvest Record'}
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
