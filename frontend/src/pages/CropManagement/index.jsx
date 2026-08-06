import React, { useState, useMemo } from 'react';
import {
  Plus,
  Sprout,
  CheckCircle2,
  Sparkles,
  Weight,
  IndianRupee,
  Calendar
} from 'lucide-react';

import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { EmptyState } from '../../components/EmptyState';

import { CropCard } from '../../components/CropCard';
import { CropForm } from '../../components/CropForm';
import { CropFilters } from '../../components/CropFilters';
import { CropDetailsModal } from '../../components/CropDetailsModal';
import { useCrops } from '../../context/CropContext';

export default function CropManagement() {
  const { crops, addCrop, updateCrop, deleteCrop, summaryMetrics } = useCrops();

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

  // Filter Crops List
  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      // Search match
      const matchesSearch =
        searchQuery.trim() === '' ||
        crop.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.seedVariety.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (crop.notes && crop.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status match
      const matchesStatus = statusFilter === '' || crop.status === statusFilter;

      // Tank match
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

  const handleSaveCrop = (formData) => {
    if (editingCrop) {
      updateCrop(editingCrop.id, formData);
    } else {
      addCrop(formData);
    }
    setIsFormOpen(false);
    setEditingCrop(null);
  };

  const handleConfirmDelete = () => {
    if (deletingCrop) {
      deleteCrop(deletingCrop.id);
      setIsDeleteOpen(false);
      setDeletingCrop(null);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setTankFilter('');
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Crop Management"
        subtitle="Track active culture batches, seed stocking, growth cycles, and estimated harvest yield."
        badge={<Badge variant="primary">{summaryMetrics.activeCropsCount} Active Batches</Badge>}
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

      {/* 2. TOP SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Active Crops</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{summaryMetrics.activeCropsCount} Batches</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total PL Stocked</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">
                {(summaryMetrics.totalPlStocked / 1000).toFixed(0)}k <span className="text-xs font-normal text-text-secondary">PL</span>
              </span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Weight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Expected Harvest</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">
                {(summaryMetrics.expectedHarvestKg / 1000).toFixed(2)} <span className="text-xs font-normal text-text-secondary">Tons</span>
              </span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Estimated Revenue</span>
              <span className="text-lg font-bold text-emerald-700 tracking-tight">
                ₹{(summaryMetrics.estimatedRevenueRupees / 100000).toFixed(2)} <span className="text-xs font-normal text-text-secondary">Lakhs</span>
              </span>
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
        <Card padding="relaxed" className="border-border/80">
          <EmptyState
            title="No Crops Found"
            description={
              searchQuery || statusFilter || tankFilter
                ? "No crop batches match your current filter criteria. Try resetting filters or searching for another term."
                : "You haven't registered any crop batches yet. Click the button below to register your first culture batch."
            }
            actionLabel={
              searchQuery || statusFilter || tankFilter ? "Reset Filters" : "Register First Crop"
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
        title={editingCrop ? 'Edit Crop Batch' : 'Register New Crop Batch'}
        description={
          editingCrop
            ? `Update properties for ${editingCrop.cropName}`
            : 'Register seed stocking, species, expected production, and target harvest date.'
        }
        size="lg"
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

      {/* 6. CROP DETAILS MODAL */}
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
            ? `Are you sure you want to delete "${deletingCrop.cropName}"? This action cannot be undone.`
            : 'Are you sure you want to delete this crop batch?'
        }
        confirmText="Delete Crop"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
