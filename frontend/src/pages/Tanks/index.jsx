import React, { useState, useMemo } from 'react';
import {
  Plus,
  Container,
  CheckCircle2,
  Maximize2,
  Waves,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Layers
} from 'lucide-react';

import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { EmptyState } from '../../components/EmptyState';
import { TankCard } from '../../components/TankCard';
import { TankForm } from '../../components/TankForm';
import { TankFilters } from '../../components/TankFilters';
import { useTanks } from '../../context/TankContext';

export default function Tanks() {
  const { tanks = [], addTank, updateTank, deleteTank, loading, error } = useTanks();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // Modal Control States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTank, setEditingTank] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingTank, setViewingTank] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTank, setDeletingTank] = useState(null);

  // Filter Tanks List Safely
  const filteredTanks = useMemo(() => {
    const list = tanks || [];
    return list.filter((tank) => {
      if (!tank) return false;
      const nameStr = tank.name || tank.tankName || '';
      const remarksStr = tank.remarks || '';
      const query = (searchQuery || '').trim().toLowerCase();

      // Search query filter (matches name or remarks)
      const matchesSearch =
        query === '' ||
        nameStr.toLowerCase().includes(query) ||
        remarksStr.toLowerCase().includes(query);

      // Status filter
      const matchesStatus = statusFilter === '' || tank.status === statusFilter;

      // Water source filter
      const matchesSource = sourceFilter === '' || tank.waterSource === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [tanks, searchQuery, statusFilter, sourceFilter]);

  // Operational Metrics Summary Safely
  const stats = useMemo(() => {
    const list = tanks || [];
    const totalCount = list.length;
    const activeCount = list.filter((t) => t && t.status === 'Active').length;
    const totalArea = list.reduce((acc, t) => acc + (parseFloat(t?.area) || 0), 0);

    return {
      totalCount,
      activeCount,
      totalArea: totalArea.toFixed(1),
    };
  }, [tanks]);

  // Form Handlers
  const handleOpenAdd = () => {
    setEditingTank(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (tank) => {
    setEditingTank(tank);
    setIsFormOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleOpenDetails = (tank) => {
    setViewingTank(tank);
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = (tank) => {
    setDeletingTank(tank);
    setIsDeleteOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleSaveTank = async (formData) => {
    try {
      if (editingTank) {
        await updateTank(editingTank.id, formData);
      } else {
        await addTank(formData);
      }
      setIsFormOpen(false);
      setEditingTank(null);
    } catch (err) {
      console.error('Error saving tank:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingTank) {
      try {
        await deleteTank(deletingTank.id);
        setIsDeleteOpen(false);
        setDeletingTank(null);
      } catch (err) {
        console.error('Error deleting tank:', err);
      }
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setSourceFilter('');
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Tank Management"
        subtitle="Monitor and manage farm ponds, dimensions, water sources, and stocking status."
        badge={<Badge variant="primary">{stats.totalCount} Tanks</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
            className="font-semibold shadow-xs"
          >
            Add New Tank
          </Button>
        }
      />

      {/* 2. OPERATIONAL SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Container className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Tanks</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{stats.totalCount}</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Active Stocked</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{stats.activeCount}</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Maximize2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Area</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{stats.totalArea} <span className="text-xs font-normal text-text-secondary">Acres</span></span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. SEARCH & FILTERS */}
      <TankFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sourceFilter={sourceFilter}
        onSourceChange={setSourceFilter}
        onReset={handleResetFilters}
      />

      {/* 4. TANKS GRID OR EMPTY STATE */}
      {filteredTanks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTanks.map((tank) => (
            <TankCard
              key={tank.id}
              tank={tank}
              onView={handleOpenDetails}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        <Card padding="relaxed" className="border-border/80">
          <EmptyState
            title="No Tanks Found"
            description={
              searchQuery || statusFilter || sourceFilter
                ? "No tanks match your current filter criteria. Try clearing filters or searching for a different term."
                : "You haven't added any tanks yet. Click the button below to register your first pond."
            }
            actionLabel={
              searchQuery || statusFilter || sourceFilter ? "Reset Filters" : "Add First Tank"
            }
            onAction={
              searchQuery || statusFilter || sourceFilter ? handleResetFilters : handleOpenAdd
            }
          />
        </Card>
      )}

      {/* 5. ADD / EDIT TANK MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTank(null);
        }}
        title={editingTank ? 'Edit Tank Details' : 'Add New Tank'}
        description={
          editingTank
            ? `Update properties for ${editingTank.name || editingTank.tankName || 'Tank'}`
            : 'Register a new aquaculture pond into your farm setup.'
        }
        size="lg"
      >
        <TankForm
          initialData={editingTank}
          onSubmit={handleSaveTank}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingTank(null);
          }}
        />
      </Modal>

      {/* 6. TANK DETAILS MODAL */}
      {viewingTank && (
        <Modal
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setViewingTank(null);
          }}
          title={viewingTank.name || viewingTank.tankName || 'Tank Details'}
          description="Detailed tank specifications and operating parameters"
          size="md"
        >
          <div className="space-y-6">
            {/* Header Badge & Status */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border">
              <span className="text-xs font-semibold text-text-secondary">Current Operating Status</span>
              <Badge
                variant={
                  viewingTank.status === 'Active'
                    ? 'success'
                    : viewingTank.status === 'Preparation'
                    ? 'warning'
                    : 'neutral'
                }
              >
                {viewingTank.status || 'Active'}
              </Badge>
            </div>

            {/* Spec Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-surface border border-border flex items-center gap-3">
                <Maximize2 className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <span className="text-[10px] text-text-secondary uppercase font-semibold block">Area</span>
                  <span className="text-sm font-bold text-text-primary">{viewingTank.area} Acres</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border flex items-center gap-3">
                <Layers className="w-5 h-5 text-secondary shrink-0" />
                <div>
                  <span className="text-[10px] text-text-secondary uppercase font-semibold block">Depth</span>
                  <span className="text-sm font-bold text-text-primary">{viewingTank.depth} Feet</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border flex items-center gap-3">
                <Waves className="w-5 h-5 text-accent shrink-0" />
                <div>
                  <span className="text-[10px] text-text-secondary uppercase font-semibold block">Water Source</span>
                  <span className="text-sm font-bold text-text-primary">{viewingTank.waterSource}</span>
                </div>
              </div>
            </div>

            {/* Dates Row */}
            <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-border/60">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-text-secondary" /> Registered: {viewingTank.createdAt ? new Date(viewingTank.createdAt).toLocaleDateString() : 'N/A'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-text-secondary" /> Last Water Log: {viewingTank.lastTested || 'Recent'}
              </span>
            </div>

            {/* Remarks Section */}
            {viewingTank.remarks && (
              <div className="p-3.5 rounded-xl bg-background border border-border">
                <span className="text-xs font-bold text-text-primary block mb-1">Remarks & Operational Notes</span>
                <p className="text-xs text-text-secondary leading-relaxed">{viewingTank.remarks}</p>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(viewingTank)}
                icon={<Edit3 className="w-4 h-4" />}
              >
                Edit Tank
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={() => handleOpenDelete(viewingTank)}
                icon={<Trash2 className="w-4 h-4" />}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 7. DELETE CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingTank(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Tank"
        message={
          deletingTank
            ? `Are you sure you want to delete "${deletingTank.name || deletingTank.tankName}"? This action cannot be undone.`
            : 'Are you sure you want to delete this tank?'
        }
        confirmText="Delete Tank"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
