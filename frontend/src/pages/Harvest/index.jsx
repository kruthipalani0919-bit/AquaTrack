import React, { useState, useMemo } from 'react';
import { Plus, Wheat, Weight, IndianRupee, TrendingUp } from 'lucide-react';

import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { EmptyState } from '../../components/EmptyState';

import { HarvestCard } from '../../components/HarvestCard';
import { HarvestForm } from '../../components/HarvestForm';
import { HarvestFilters } from '../../components/HarvestFilters';
import { HarvestDetailsModal } from '../../components/HarvestDetailsModal';
import { useHarvests } from '../../context/HarvestContext';

export default function Harvest() {
  const { harvests, addHarvest, updateHarvest, deleteHarvest } = useHarvests();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [tankFilter, setTankFilter] = useState('');

  // Modal Controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingHarvest, setViewingHarvest] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingHarvest, setDeletingHarvest] = useState(null);

  // Filter Harvest List
  const filteredHarvests = useMemo(() => {
    return harvests.filter((harv) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        harv.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        harv.tankName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTank = tankFilter === '' || harv.tankId === tankFilter;

      return matchesSearch && matchesTank;
    });
  }, [harvests, searchQuery, tankFilter]);

  // Operational Metrics Summary
  const stats = useMemo(() => {
    const totalCount = harvests.length;
    const totalProductionKg = harvests.reduce((acc, h) => acc + (parseFloat(h.production) || 0), 0);
    const avgAbwGrams = totalCount > 0
      ? (harvests.reduce((acc, h) => acc + (parseFloat(h.averageWeight) || 0), 0) / totalCount).toFixed(1)
      : 0;
    const avgPricePerKg = totalCount > 0
      ? (harvests.reduce((acc, h) => acc + (parseFloat(h.sellingPrice) || 0), 0) / totalCount).toFixed(0)
      : 0;

    return {
      totalCount,
      totalProductionKg,
      avgAbwGrams,
      avgPricePerKg,
    };
  }, [harvests]);

  // Handlers
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

  const handleSaveHarvest = (formData) => {
    if (editingHarvest) {
      updateHarvest(editingHarvest.id, formData);
    } else {
      addHarvest(formData);
    }
    setIsFormOpen(false);
    setEditingHarvest(null);
  };

  const handleConfirmDelete = () => {
    if (deletingHarvest) {
      deleteHarvest(deletingHarvest.id);
      setIsDeleteOpen(false);
      setDeletingHarvest(null);
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
        title="Harvest Management"
        subtitle="Log pond harvest yields, body weights (ABW), selling prices, and buyer details."
        badge={<Badge variant="accent">{stats.totalCount} Harvest Logs</Badge>}
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

      {/* 2. OPERATIONAL METRICS SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Wheat className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Production</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{stats.totalProductionKg.toLocaleString()} kg</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
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
            <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Avg Selling Price</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">₹{stats.avgPricePerKg}/kg</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Logs</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{stats.totalCount} Batches</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. FILTERS */}
      <HarvestFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        tankFilter={tankFilter}
        onTankChange={setTankFilter}
        onReset={handleResetFilters}
      />

      {/* 4. HARVEST GRID OR EMPTY STATE */}
      {filteredHarvests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredHarvests.map((harvest) => (
            <HarvestCard
              key={harvest.id}
              harvest={harvest}
              onView={handleOpenDetails}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        <Card padding="relaxed" className="border-border/80">
          <EmptyState
            title="No Harvest Records Found"
            description={
              searchQuery || tankFilter
                ? "No harvest logs match your search or tank filter criteria. Try clearing filters."
                : "You haven't registered any pond harvest events yet. Click below to add your first record."
            }
            actionLabel={
              searchQuery || tankFilter ? "Reset Filters" : "Register Harvest"
            }
            onAction={
              searchQuery || tankFilter ? handleResetFilters : handleOpenAdd
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
            ? `Update harvest parameters for ${editingHarvest.tankName}`
            : 'Record yield, body weight, selling price, and buyer details for completed crop.'
        }
        size="lg"
      >
        <HarvestForm
          initialData={editingHarvest}
          onSubmit={handleSaveHarvest}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingHarvest(null);
          }}
        />
      </Modal>

      {/* 6. HARVEST DETAILS MODAL */}
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
            ? `Are you sure you want to delete the harvest record for "${deletingHarvest.tankName}"? This action cannot be undone.`
            : 'Are you sure you want to delete this harvest record?'
        }
        confirmText="Delete Harvest"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
