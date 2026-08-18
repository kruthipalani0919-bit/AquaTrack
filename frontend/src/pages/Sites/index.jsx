import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Container, Building2, ShieldAlert } from 'lucide-react';

import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { SiteCard } from '../../components/SiteCard';
import { SiteForm } from '../../components/SiteForm';
import { SiteFilters } from '../../components/SiteFilters';
import { useSites } from '../../context/SiteContext';

export default function Sites() {
  const navigate = useNavigate();
  const { sites = [], addSite, updateSite, deleteSite, loading, error } = useSites();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');

  // Modal Control States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingSite, setDeletingSite] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Distinct District Options for Filter
  const districtOptions = useMemo(() => {
    const list = sites || [];
    const set = new Set();
    list.forEach((s) => {
      if (s?.district) set.add(s.district);
    });
    return Array.from(set).sort();
  }, [sites]);

  // Filter Sites List
  const filteredSites = useMemo(() => {
    const list = sites || [];
    return list.filter((site) => {
      if (!site) return false;
      const siteName = site.siteName || '';
      const location = site.location || '';
      const district = site.district || '';
      const state = site.state || '';
      const remarks = site.remarks || '';
      const query = (searchQuery || '').trim().toLowerCase();

      const matchesSearch =
        query === '' ||
        siteName.toLowerCase().includes(query) ||
        location.toLowerCase().includes(query) ||
        district.toLowerCase().includes(query) ||
        state.toLowerCase().includes(query) ||
        remarks.toLowerCase().includes(query);

      const matchesDistrict = districtFilter === '' || site.district === districtFilter;

      return matchesSearch && matchesDistrict;
    });
  }, [sites, searchQuery, districtFilter]);

  // Operational Metrics Summary
  const stats = useMemo(() => {
    const list = sites || [];
    const totalSites = list.length;
    const totalDistricts = districtOptions.length;
    const totalTanks = list.reduce((acc, s) => {
      const count = Array.isArray(s?.tanks) ? s.tanks.length : (s?._count?.tanks || 0);
      return acc + count;
    }, 0);

    return {
      totalSites,
      totalDistricts,
      totalTanks,
    };
  }, [sites, districtOptions]);

  // Form Handlers
  const handleOpenAdd = () => {
    setEditingSite(null);
    setModalError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (site) => {
    setEditingSite(site);
    setModalError('');
    setIsFormOpen(true);
  };

  const handleOpenDelete = (site) => {
    setDeletingSite(site);
    setIsDeleteOpen(true);
  };

  const handleSaveSite = async (formData) => {
    setIsSubmitting(true);
    setModalError('');
    try {
      if (editingSite) {
        await updateSite(editingSite.id, formData);
      } else {
        await addSite(formData);
      }
      setIsFormOpen(false);
      setEditingSite(null);
    } catch (err) {
      console.error('Error saving site:', err);
      setModalError(err.message || 'Failed to save site details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSite) return;
    setIsDeleting(true);
    try {
      await deleteSite(deletingSite.id);
      setIsDeleteOpen(false);
      setDeletingSite(null);
    } catch (err) {
      console.error('Error deleting site:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewTanks = (site) => {
    navigate(`/tanks?siteId=${site.id}`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDistrictFilter('');
  };

  const deleteWarningMessage = useMemo(() => {
    if (!deletingSite) return '';
    const tankCount = Array.isArray(deletingSite.tanks)
      ? deletingSite.tanks.length
      : (deletingSite._count?.tanks || 0);

    if (tankCount > 0) {
      return 'This site contains tanks. Deleting the site may also remove its associated tank data. Are you sure you want to continue?';
    }
    return 'Are you sure you want to delete this site?';
  }, [deletingSite]);

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Site Management"
        subtitle="Manage the locations and sites within your farm."
        badge={<Badge variant="primary">{stats.totalSites} Sites</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
            className="font-semibold shadow-xs"
          >
            Add Site
          </Button>
        }
      />

      {/* 2. OPERATIONAL SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Sites</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{stats.totalSites}</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Districts</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{stats.totalDistricts}</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Container className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Tanks</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{stats.totalTanks}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. SEARCH & FILTERS */}
      <SiteFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        districtFilter={districtFilter}
        onDistrictChange={setDistrictFilter}
        districtOptions={districtOptions}
        onReset={handleResetFilters}
      />

      {/* 4. MAIN CONTENT AREA */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <Loader size="lg" color="primary" />
          <span className="text-xs font-medium text-text-secondary mt-3">Loading farm sites...</span>
        </div>
      ) : error ? (
        <Card padding="normal" className="border-danger/30 bg-danger-light/10 text-center py-8">
          <div className="w-12 h-12 rounded-full bg-danger-light/30 text-danger flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-text-primary mb-1">Failed to Load Sites</h3>
          <p className="text-xs text-text-secondary max-w-md mx-auto">{error}</p>
        </Card>
      ) : filteredSites.length === 0 ? (
        <EmptyState
          title={searchQuery || districtFilter ? "No matching sites found" : "No sites found"}
          description={
            searchQuery || districtFilter
              ? "Try adjusting your search terms or filters to find what you are looking for."
              : "Create your first site to get started."
          }
          actionLabel={searchQuery || districtFilter ? "Clear Filters" : "Add Site"}
          onAction={searchQuery || districtFilter ? handleResetFilters : handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSites.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              onViewTanks={handleViewTanks}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* 5. ADD / EDIT SITE MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => !isSubmitting && setIsFormOpen(false)}
        title={editingSite ? 'Edit Site' : 'Add New Site'}
        description={
          editingSite
            ? 'Update location details and remarks for this site.'
            : 'Register a new site location under your farm.'
        }
        size="md"
      >
        <SiteForm
          initialData={editingSite}
          onSubmit={handleSaveSite}
          onCancel={() => setIsFormOpen(false)}
          isSubmitting={isSubmitting}
          error={modalError}
        />
      </Modal>

      {/* 6. DELETE CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => !isDeleting && setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Site"
        message={deleteWarningMessage}
        confirmText="Yes, Delete Site"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
