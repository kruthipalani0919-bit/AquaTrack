import React, { useState, useMemo } from 'react';
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

export default function CropManagement() {
  const {
    crops = [],
    addCrop,
    updateCrop,
    deleteCrop,
    loading
  } = useCrops();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [tankFilter, setTankFilter] = useState('');

  // Modal Control States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingCrop, setViewingCrop] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCrop, setDeletingCrop] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

      const matchesTank = tankFilter === '' || crop.tankId === tankFilter;

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
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingCrop) {
      setIsDeleting(true);
      try {
        await deleteCrop(deletingCrop.id);
        setIsDeleteOpen(false);
        setDeletingCrop(null);
      } catch (err) {
        console.error('Error deleting crop:', err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setTankFilter('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Crop Management"
        subtitle="Track and manage crop batches across your farm tanks."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
            className="font-semibold shadow-xs"
          >
            Register New Crop
          </Button>
        }
      />

      {/* 2. SEARCH & FILTERS (No summary cards, direct transition) */}
      <CropFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        tankFilter={tankFilter}
        onTankChange={setTankFilter}
        onReset={handleResetFilters}
      />

      {/* 3. CROPS GRID OR EMPTY STATE */}
      {filteredCrops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCrops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              onView={handleOpenDetails}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        <Card padding="relaxed" className="border-border/80 shadow-2xs">
          <EmptyState
            title="No Crop Batches Found"
            description={
              searchQuery || tankFilter
                ? "No crop batches match your filter criteria. Try resetting filters."
                : "No crop batches have been registered yet."
            }
            actionLabel={
              searchQuery || tankFilter ? "Reset Filters" : "Register New Crop"
            }
            onAction={
              searchQuery || tankFilter ? handleResetFilters : handleOpenAdd
            }
          />
        </Card>
      )}

      {/* 4. ADD / EDIT CROP MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCrop(null);
        }}
        title={editingCrop ? 'Edit Crop Details' : 'Register New Crop'}
        description={
          editingCrop
            ? `Update details for Batch ${editingCrop.batchNumber || editingCrop.cropName || 'Crop'}`
            : 'Register a new aquaculture crop batch into a farm tank.'
        }
        size="md"
      >
        <CropForm
          initialData={editingCrop}
          onSubmit={handleSaveCrop}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingCrop(null);
          }}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* 5. VIEW CROP DETAILS MODAL */}
      <CropDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setViewingCrop(null);
        }}
        crop={viewingCrop}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* 6. DELETE CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingCrop(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Crop Record"
        message={
          deletingCrop
            ? `Are you sure you want to delete crop record for "Batch ${deletingCrop.batchNumber || deletingCrop.cropName || 'Crop'}"? This action cannot be undone.`
            : 'Are you sure you want to delete this crop record?'
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete Crop Record'}
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
