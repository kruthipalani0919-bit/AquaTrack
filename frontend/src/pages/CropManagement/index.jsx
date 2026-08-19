import React, { useState, useMemo } from 'react';
import {
  Plus,
  Sprout,
  Container
} from 'lucide-react';

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
    summaryMetrics = { activeCropsCount: 0 },
    loading
  } = useCrops();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tankFilter, setTankFilter] = useState('');

  // Modal Control States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingCrop, setViewingCrop] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCrop, setDeletingCrop] = useState(null);

  const activeCropsCount = useMemo(() => {
    return (crops || []).filter((c) => c && (c.status === 'Active' || c.status === 'ACTIVE')).length;
  }, [crops]);

  const totalCropsCount = (crops || []).length;

  // Filter Crops List Safely
  const filteredCrops = useMemo(() => {
    const list = crops || [];
    const query = (searchQuery || '').trim().toLowerCase();

    return list.filter((crop) => {
      if (!crop) return false;
      const batchStr = crop.batchNumber || '';
      const nameStr = crop.cropName || '';
      const varietyStr = crop.seedVariety || '';
      const tankStr = crop.tankName || crop.tank?.tankName || '';
      const notesStr = crop.notes || '';

      const matchesSearch =
        query === '' ||
        batchStr.toLowerCase().includes(query) ||
        nameStr.toLowerCase().includes(query) ||
        varietyStr.toLowerCase().includes(query) ||
        tankStr.toLowerCase().includes(query) ||
        notesStr.toLowerCase().includes(query);

      const matchesStatus = statusFilter === '' || crop.status === statusFilter;
      const matchesTank = tankFilter === '' || crop.tankId === tankFilter;

      return matchesSearch && matchesStatus && matchesTank;
    });
  }, [crops, searchQuery, statusFilter, tankFilter]);

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
    setStatusFilter('');
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

      {/* 2. TOP SUMMARY CARDS (Active Crops & Total Crops) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card padding="compact" className="border-border/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Active Crops</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{activeCropsCount} Batches</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Container className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Crops / Batches</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{totalCropsCount} Batches</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. SEARCH & FILTERS */}
      <CropFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        tankFilter={tankFilter}
        onTankChange={setTankFilter}
        onReset={handleResetFilters}
      />

      {/* 4. CROPS GRID OR EMPTY STATE */}
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
              searchQuery || statusFilter || tankFilter
                ? "No crop batches match your filter criteria. Try resetting filters."
                : "No crop batches have been registered yet."
            }
            actionLabel={
              searchQuery || statusFilter || tankFilter ? "Reset Filters" : "Register New Crop"
            }
            onAction={
              searchQuery || statusFilter || tankFilter ? handleResetFilters : handleOpenAdd
            }
          />
        </Card>
      )}

      {/* 5. ADD / EDIT CROP MODAL */}
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
        />
      </Modal>

      {/* 6. VIEW CROP PROGRESS MODAL */}
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

      {/* 7. DELETE CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingCrop(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Crop Batch"
        message={
          deletingCrop
            ? `Are you sure you want to delete crop batch "${deletingCrop.batchNumber || deletingCrop.cropName}"? This action cannot be undone.`
            : 'Are you sure you want to delete this crop batch?'
        }
        confirmText="Delete Crop"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
