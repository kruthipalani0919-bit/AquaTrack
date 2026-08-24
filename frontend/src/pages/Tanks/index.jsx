import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Plus,
  Container,
  Maximize2,
  Edit3,
  Trash2,
  MapPin,
  ShieldAlert,
  FileText,
  Building2,
  Layers,
  AlertCircle
} from 'lucide-react';

import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { TankCard } from '../../components/TankCard';
import { TankForm } from '../../components/TankForm';
import { TankFilters } from '../../components/TankFilters';
import { useTanks } from '../../context/TankContext';
import { useSites } from '../../context/SiteContext';
import { subscribeToSyncBus } from '../../utils/syncBus';

export default function Tanks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSiteId = searchParams.get('siteId') || '';

  const { tanks = [], addTank, updateTank, deleteTank, loading, error } = useTanks();
  const { sites = [], loading: sitesLoading } = useSites();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [siteFilter, setSiteFilter] = useState(initialSiteId);

  // Modal Control States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTank, setEditingTank] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingTank, setViewingTank] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTank, setDeletingTank] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset site filter automatically if the selected site was deleted
  useEffect(() => {
    if (siteFilter && sites.length > 0) {
      const exists = sites.some((s) => String(s.id) === String(siteFilter));
      if (!exists) {
        setSiteFilter('');
        setSearchParams({});
      }
    }
  }, [sites, siteFilter, setSearchParams]);

  // Subscribe to sync bus events for immediate reactive resets
  useEffect(() => {
    const unsubscribe = subscribeToSyncBus((detail) => {
      if (detail.action === 'DELETE') {
        if (detail.entityType === 'SITE' && detail.payload?.siteId === siteFilter) {
          setSiteFilter('');
          setSearchParams({});
        }
        if (detail.entityType === 'TANK' && detail.payload?.tankId) {
          const tId = String(detail.payload.tankId);
          if (viewingTank && String(viewingTank.id) === tId) {
            setIsDetailsOpen(false);
            setViewingTank(null);
          }
          if (deletingTank && String(deletingTank.id) === tId) {
            setIsDeleteOpen(false);
            setDeletingTank(null);
          }
          if (editingTank && String(editingTank.id) === tId) {
            setIsFormOpen(false);
            setEditingTank(null);
          }
        }
      }
    });
    return unsubscribe;
  }, [siteFilter, viewingTank, deletingTank, editingTank, setSearchParams]);

  // Filter Tanks List Safely
  const filteredTanks = useMemo(() => {
    const list = tanks || [];
    return list.filter((tank) => {
      if (!tank) return false;
      const nameStr = tank.name || tank.tankName || '';
      const remarksStr = tank.remarks || tank.notes || '';
      const hatcheryNameStr = tank.hatcheryName || '';
      const hatcheryUnitStr = tank.hatcheryUnit || '';
      const query = (searchQuery || '').trim().toLowerCase();

      // Search query filter (matches name, remarks, or hatchery details)
      const matchesSearch =
        query === '' ||
        nameStr.toLowerCase().includes(query) ||
        remarksStr.toLowerCase().includes(query) ||
        hatcheryNameStr.toLowerCase().includes(query) ||
        hatcheryUnitStr.toLowerCase().includes(query);

      // Site filter
      const matchesSite = siteFilter === '' || String(tank.siteId) === String(siteFilter);

      return matchesSearch && matchesSite;
    });
  }, [tanks, searchQuery, siteFilter]);

  // Operational Metrics Summary Safely
  const stats = useMemo(() => {
    const list = tanks || [];
    const totalCount = list.length;
    const totalArea = list.reduce((acc, t) => acc + (parseFloat(t?.area) || 0), 0);

    return {
      totalCount,
      totalArea: totalArea.toFixed(1),
    };
  }, [tanks]);

  // Selected site object if siteFilter is active
  const selectedSite = useMemo(() => {
    if (!siteFilter) return null;
    return sites.find((s) => String(s.id) === String(siteFilter));
  }, [sites, siteFilter]);

  // Form Handlers
  const handleOpenAdd = () => {
    setEditingTank(null);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (tank) => {
    if (!tank || !tank.id) return;
    setEditingTank({ ...tank });
    setFormError('');
    setIsFormOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleOpenDetails = (tank) => {
    if (!tank || !tank.id) return;
    setViewingTank({ ...tank });
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = (tank) => {
    if (!tank || !tank.id) return;
    setDeletingTank({ ...tank });
    setIsDeleteOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleSaveTank = async (formData) => {
    setIsSubmitting(true);
    setFormError('');
    try {
      if (editingTank && editingTank.id) {
        await updateTank(editingTank.id, formData);
      } else {
        await addTank(formData);
      }
      setIsFormOpen(false);
      setEditingTank(null);
    } catch (err) {
      console.error('Error saving tank:', err);
      setFormError(err.message || 'Failed to save tank details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingTank && deletingTank.id) {
      setIsDeleting(true);
      try {
        await deleteTank(deletingTank.id);
        setIsDeleteOpen(false);
        setDeletingTank(null);
      } catch (err) {
        console.error('Error deleting tank:', err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSiteFilter('');
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title={selectedSite ? `Tanks in ${selectedSite.siteName}` : "Tank Management"}
        subtitle={
          selectedSite
            ? `Viewing tanks belonging to ${selectedSite.siteName} (${selectedSite.location})`
            : "Monitor and manage farm tanks, dimensions, and site allocation."
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
            className="font-semibold shadow-xs cursor-pointer"
          >
            Add New Tank
          </Button>
        }
      />

      {/* 2. OPERATIONAL SUMMARY METRICS (Exclusively 2 Cards: Total Tanks & Total Area) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Farm Area</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{stats.totalArea} Acres</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. TANK SEARCH & SITE FILTERS BAR */}
      <TankFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        siteFilter={siteFilter}
        onSiteFilterChange={(val) => {
          setSiteFilter(val);
          if (val) setSearchParams({ siteId: val });
          else setSearchParams({});
        }}
        sites={sites}
        onResetFilters={handleResetFilters}
      />

      {/* 4. TANKS GRID OR EMPTY STATE */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader text="Loading farm tanks..." />
        </div>
      ) : filteredTanks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTanks.map((tank) => (
            <TankCard
              key={tank.id}
              tank={tank}
              onViewDetails={() => handleOpenDetails(tank)}
              onEdit={() => handleOpenEdit(tank)}
              onDelete={() => handleOpenDelete(tank)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={searchQuery || siteFilter ? "No matching tanks found" : "No tanks registered yet"}
          description={
            searchQuery || siteFilter
              ? "Try adjusting your search criteria or site filter."
              : "Start by registering your first pond tank to configure dimensions and culture cycles."
          }
          actionLabel={searchQuery || siteFilter ? "Reset Filters" : "Add New Tank"}
          onAction={searchQuery || siteFilter ? handleResetFilters : handleOpenAdd}
        />
      )}

      {/* 5. ADD / EDIT TANK FORM MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsFormOpen(false);
            setEditingTank(null);
            setFormError('');
          }
        }}
        title={editingTank ? "Edit Tank Details" : "Add New Tank"}
        maxWidth="max-w-lg"
      >
        {formError && (
          <div className="mb-4 p-3 bg-danger-light text-danger rounded-lg text-xs font-medium border border-danger/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}
        <TankForm
          key={editingTank ? editingTank.id : 'new-tank'}
          initialData={editingTank}
          sites={sites}
          preselectedSiteId={editingTank?.siteId || siteFilter}
          defaultSiteId={editingTank?.siteId || siteFilter}
          onSubmit={handleSaveTank}
          onCancel={() => {
            if (!isSubmitting) {
              setIsFormOpen(false);
              setEditingTank(null);
              setFormError('');
            }
          }}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* 6. VIEW TANK DETAILS MODAL */}
      {viewingTank && (
        <Modal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title={`Tank Details: ${viewingTank.name || viewingTank.tankName}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-background rounded-xl border border-border space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-text-secondary font-medium">Tank ID</span>
                <span className="font-bold text-text-primary">{viewingTank.id}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-text-secondary font-medium">Tank Name</span>
                <span className="font-bold text-text-primary">{viewingTank.name || viewingTank.tankName}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-text-secondary font-medium">Area</span>
                <span className="font-bold text-text-primary">{viewingTank.area} Acres</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-text-secondary font-medium">Depth</span>
                <span className="font-bold text-text-primary">{viewingTank.depth || 'Standard'} ft</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-text-secondary font-medium">Water Source</span>
                <span className="font-bold text-text-primary">{viewingTank.waterSource || 'Ground Water'}</span>
              </div>

              {viewingTank.hatcheryName && (
                <div className="flex justify-between items-center pb-2 border-b border-border/60">
                  <span className="text-text-secondary font-medium">Hatchery Name</span>
                  <span className="font-bold text-text-primary">{viewingTank.hatcheryName}</span>
                </div>
              )}

              {viewingTank.hatcheryUnit && (
                <div className="flex justify-between items-center pb-2 border-b border-border/60">
                  <span className="text-text-secondary font-medium">Hatchery Unit</span>
                  <span className="font-bold text-text-primary">{viewingTank.hatcheryUnit}</span>
                </div>
              )}

              {viewingTank.remarks && (
                <div className="pt-1">
                  <span className="text-text-secondary font-medium block mb-1">Remarks</span>
                  <p className="text-text-primary bg-surface p-2 rounded-lg border border-border/50">{viewingTank.remarks}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEdit(viewingTank)}
                icon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Edit Tank
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailsOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 7. DELETE TANK CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Tank"
        message={`Are you sure you want to delete tank "${deletingTank?.name || deletingTank?.tankName || 'Tank'}"? All culture records associated with this tank will be removed.`}
        confirmText={isDeleting ? "Deleting..." : "Delete Tank"}
        cancelText="Cancel"
        variant="danger"
        disabled={isDeleting}
      />
    </div>
  );
}
