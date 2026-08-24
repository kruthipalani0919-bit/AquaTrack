import React, { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';

import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { EmptyState } from '../../components/EmptyState';

import { CropCard } from '../../components/CropCard';
import { CropForm } from '../../components/CropForm';
import { CropFilters } from '../../components/CropFilters';
import { CropDetailsModal } from '../../components/CropDetailsModal';
import { useCrops } from '../../context/CropContext';
import { useTanks } from '../../context/TankContext';
import { subscribeToSyncBus } from '../../utils/syncBus';

export default function CropManagement() {
  const {
    crops = [],
    addCrop,
    updateCrop,
    deleteCrop,
    loading
  } = useCrops();

  const { tanks = [] } = useTanks();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [tankFilter, setTankFilter] = useState('');

  // Modal Control States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingCrop, setViewingCrop] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCrop, setDeletingCrop] = useState(null);

  // Automatically reset tankFilter if the filtered tank was deleted
  useEffect(() => {
    if (tankFilter && tanks.length > 0) {
      const exists = tanks.some((t) => String(t.id) === String(tankFilter));
      if (!exists) {
        setTankFilter('');
      }
    }
  }, [tanks, tankFilter]);

  // Subscribe to sync bus events for reactive modal & selection cleanup
  useEffect(() => {
    const unsubscribe = subscribeToSyncBus((detail) => {
      if (detail.action === 'DELETE') {
        if (detail.entityType === 'TANK' && detail.payload?.tankId === tankFilter) {
          setTankFilter('');
        }
        if (detail.entityType === 'CROP' && detail.payload?.cropId) {
          const cId = String(detail.payload.cropId);
          if (viewingCrop && String(viewingCrop.id) === cId) {
            setIsDetailsOpen(false);
            setViewingCrop(null);
          }
          if (deletingCrop && String(deletingCrop.id) === cId) {
            setIsDeleteOpen(false);
            setDeletingCrop(null);
          }
          if (editingCrop && String(editingCrop.id) === cId) {
            setIsFormOpen(false);
            setEditingCrop(null);
          }
        }
      }
    });
    return unsubscribe;
  }, [tankFilter, viewingCrop, deletingCrop, editingCrop]);

  // Filter Crops List Safely
  const filteredCrops = useMemo(() => {
    const list = crops || [];
    const query = (searchQuery || '').trim().toLowerCase();

    return list.filter((crop) => {
      if (!crop) return false;
      const batchStr = crop.batchNumber || '';
      const nameStr = crop.cropName || '';
      const varietyStr = crop.seedVariety || '';
      const rawTank = crop.tankName || crop.tank?.tankName || crop.tank?.name || '';
      const tankStr = rawTank.replace(/\s*\([^)]*\)/g, '').trim();
      const notesStr = crop.notes || '';

      const matchesSearch =
        query === '' ||
        batchStr.toLowerCase().includes(query) ||
        nameStr.toLowerCase().includes(query) ||
        varietyStr.toLowerCase().includes(query) ||
        tankStr.toLowerCase().includes(query) ||
        notesStr.toLowerCase().includes(query);

      const matchesTank = tankFilter === '' || String(crop.tankId) === String(tankFilter);

      return matchesSearch && matchesTank;
    });
  }, [crops, searchQuery, tankFilter]);

  // Form Handlers
  const handleOpenAdd = () => {
    setEditingCrop(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (crop) => {
    setEditingCrop(crop);
    setIsFormOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleOpenDetails = (crop) => {
    setViewingCrop(crop);
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = (crop) => {
    setDeletingCrop(crop);
    setIsDeleteOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleSaveCrop = async (formData) => {
    try {
      if (editingCrop) {
        await updateCrop(editingCrop.id, formData);
      } else {
        await addCrop(formData);
      }
      setIsFormOpen(false);
      setEditingCrop(null);
    } catch (err) {
      console.error('Error saving crop:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingCrop) {
      try {
        await deleteCrop(deletingCrop.id);
        setIsDeleteOpen(false);
        setDeletingCrop(null);
      } catch (err) {
        console.error('Error deleting crop:', err);
      }
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setTankFilter('');
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Crop Management"
        subtitle="Track active culture batches, seed stocking dates, and crop lifecycles."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
            className="font-semibold shadow-xs"
          >
            Add New Batch
          </Button>
        }
      />

      {/* 2. CROP SEARCH & FILTERS BAR */}
      <CropFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        tankFilter={tankFilter}
        onTankFilterChange={setTankFilter}
        onResetFilters={handleResetFilters}
      />

      {/* 3. CROPS GRID OR EMPTY STATE */}
      {loading ? (
        <div className="py-16 text-center">
          <span className="text-xs font-semibold text-text-secondary">Loading crop batches...</span>
        </div>
      ) : filteredCrops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCrops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              onViewDetails={() => handleOpenDetails(crop)}
              onEdit={() => handleOpenEdit(crop)}
              onDelete={() => handleOpenDelete(crop)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={searchQuery || tankFilter ? "No matching crop batches found" : "No active crop batches"}
          description={
            searchQuery || tankFilter
              ? "Try adjusting your search query or tank filter."
              : "Register a new crop batch to start monitoring stocking density, feed rations, and culture day counts."
          }
          actionLabel={searchQuery || tankFilter ? "Reset Filters" : "Add New Batch"}
          onAction={searchQuery || tankFilter ? handleResetFilters : handleOpenAdd}
        />
      )}

      {/* 4. ADD / EDIT CROP FORM MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCrop ? "Edit Crop Batch" : "Register New Crop Batch"}
        maxWidth="max-w-md"
      >
        <CropForm
          initialData={editingCrop}
          onSubmit={handleSaveCrop}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* 5. VIEW CROP DETAILS MODAL */}
      {viewingCrop && (
        <CropDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          crop={viewingCrop}
          onEdit={() => handleOpenEdit(viewingCrop)}
        />
      )}

      {/* 6. DELETE CROP CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Crop Batch"
        message={`Are you sure you want to delete crop batch "${deletingCrop?.cropName || deletingCrop?.batchNumber || 'Batch'}"? Associated feeding logs and harvest history may also be affected.`}
        confirmText="Delete Batch"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
