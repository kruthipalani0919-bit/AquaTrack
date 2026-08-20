import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Plus,
  Container,
  Maximize2,
  Edit3,
  Trash2,
  MapPin,
  ShieldAlert,
  FileText
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
import { useSites } from '../../context/SiteContext';

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
      const remarksStr = tank.remarks || tank.notes || '';
      const query = (searchQuery || '').trim().toLowerCase();

      // Search query filter (matches name or remarks)
      const matchesSearch =
        query === '' ||
        nameStr.toLowerCase().includes(query) ||
        remarksStr.toLowerCase().includes(query);

      // Site filter
      const matchesSite = siteFilter === '' || tank.siteId === siteFilter;

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
    return sites.find((s) => s.id === siteFilter);
  }, [sites, siteFilter]);

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
            className="font-semibold shadow-xs"
          >
            Add New Tank
          </Button>
        }
      />

      {/* 2. OPERATIONAL SUMMARY METRICS */}
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
              <Maximize2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Water Area</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{stats.totalArea} Acres</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. SEARCH & FILTERS */}
      <TankFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        siteFilter={siteFilter}
        onSiteChange={(siteId) => {
          setSiteFilter(siteId);
          if (siteId) {
            setSearchParams({ siteId });
          } else {
            setSearchParams({});
          }
        }}
        onReset={handleResetFilters}
      />

      {/* Active Filter Notice */}
      {selectedSite && (
        <div className="p-3 bg-primary-light/40 border border-primary/20 rounded-xl flex items-center justify-between text-xs">
          <span className="text-text-primary font-medium flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            Filtering by Site: <strong className="text-primary">{selectedSite.siteName}</strong> ({selectedSite.location})
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs text-primary font-medium hover:bg-primary-light/60"
          >
            Show All Sites
          </Button>
        </div>
      )}

      {/* 4. TANKS GRID OR EMPTY STATE */}
      {filteredTanks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTanks.map((tank) => (
            <TankCard
              key={tank.id}
              tank={tank}
              onViewDetails={handleOpenDetails}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        <Card padding="relaxed" className="border-border/80">
          <EmptyState
            title={
              searchQuery || siteFilter
                ? "No matching tanks found"
                : "No tanks registered"
            }
            description={
              searchQuery || siteFilter
                ? "No tanks match your current filter criteria. Try clearing filters or searching for a different term."
                : "You haven't added any tanks yet. Click the button below to register your first tank."
            }
            actionLabel={
              searchQuery || siteFilter ? "Reset Filters" : "Add First Tank"
            }
            onAction={
              searchQuery || siteFilter ? handleResetFilters : handleOpenAdd
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
            : 'Register a new tank into your site setup.'
        }
        size="lg"
      >
        <TankForm
          initialData={editingTank}
          defaultSiteId={siteFilter}
          onSubmit={handleSaveTank}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingTank(null);
          }}
        />
      </Modal>

      {/* 6. TANK DETAILS MODAL (REDESIGNED CLIENT-FRIENDLY STRUCTURE) */}
      {viewingTank && (() => {
        const tankTitle = viewingTank.name || viewingTank.tankName || 'Tank Details';
        const targetSite = sites.find((s) => s.id === viewingTank.siteId);
        const rawSiteName = viewingTank.site?.siteName || viewingTank.siteName || targetSite?.siteName || '';
        const siteLocation = viewingTank.site?.location || targetSite?.location || '';
        const displaySiteName = rawSiteName ? (siteLocation ? `${rawSiteName} (${siteLocation})` : rawSiteName) : 'Not specified';

        const numArea = parseFloat(viewingTank.area);
        const displayAreaStr = !isNaN(numArea) && numArea > 0 ? `${numArea} Acres` : 'Not specified';

        const tankRemarks = (viewingTank.remarks || viewingTank.notes || '').trim();

        return (
          <Modal
            isOpen={isDetailsOpen}
            onClose={() => {
              setIsDetailsOpen(false);
              setViewingTank(null);
            }}
            title={tankTitle}
            description="Tank Details"
            size="md"
          >
            <div className="space-y-5">
              {/* TANK INFORMATION SECTION */}
              <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-3 shadow-2xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary/20 pb-2">
                  <Container className="w-4 h-4 text-primary" /> Tank Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* SITE */}
                  <div className="bg-surface p-3 rounded-lg border border-border/50">
                    <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" /> Site
                    </span>
                    <span className="text-sm font-bold text-text-primary mt-0.5 block truncate" title={displaySiteName}>
                      {displaySiteName}
                    </span>
                  </div>

                  {/* AREA */}
                  <div className="bg-surface p-3 rounded-lg border border-border/50">
                    <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
                      <Maximize2 className="w-3 h-3 text-primary" /> Area
                    </span>
                    <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                      {displayAreaStr}
                    </span>
                  </div>
                </div>
              </div>

              {/* REMARKS / NOTES SECTION (ONLY SHOWN IF REMARKS EXIST) */}
              {tankRemarks ? (
                <div className="p-3.5 rounded-xl bg-background border border-border/80 text-xs shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1 mb-1">
                    <FileText className="w-3.5 h-3.5 text-primary" /> Remarks / Notes
                  </span>
                  <p className="text-text-secondary leading-relaxed">{tankRemarks}</p>
                </div>
              ) : null}

              {/* FOOTER ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(viewingTank)}
                  icon={<Edit3 className="w-4 h-4" />}
                  className="font-semibold"
                >
                  Edit Tank
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleOpenDelete(viewingTank)}
                  icon={<Trash2 className="w-4 h-4" />}
                  className="font-semibold"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Modal>
        );
      })()}

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
