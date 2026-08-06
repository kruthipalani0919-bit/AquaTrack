import React, { useState, useMemo } from 'react';
import {
  Plus,
  UtensilsCrossed,
  Weight,
  TrendingUp,
  IndianRupee
} from 'lucide-react';

import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { EmptyState } from '../../components/EmptyState';

import { FeedCard } from '../../components/FeedCard';
import { FeedForm } from '../../components/FeedForm';
import { FeedFilters } from '../../components/FeedFilters';
import { FeedSchedule } from '../../components/FeedSchedule';
import { FeedDetailsModal } from '../../components/FeedDetailsModal';
import { useFeed } from '../../context/FeedContext';

export default function FeedManagement() {
  const {
    feedLogs = [],
    addFeedLog,
    updateFeedLog,
    deleteFeedLog,
    analytics = { todaysFeedKg: 0, totalFeedUsedKg: 0, avgFeedPerDayKg: 0, totalFeedCostRupees: 0 },
    loading,
    error
  } = useFeed();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [tankFilter, setTankFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modal Control States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFeedLog, setEditingFeedLog] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingFeedLog, setViewingFeedLog] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingFeedLog, setDeletingFeedLog] = useState(null);

  const safeAnalytics = {
    todaysFeedKg: analytics?.todaysFeedKg || 0,
    totalFeedUsedKg: analytics?.totalFeedUsedKg || 0,
    avgFeedPerDayKg: analytics?.avgFeedPerDayKg || 0,
    totalFeedCostRupees: analytics?.totalFeedCostRupees || 0,
  };

  // Multi-Filter Logic Safely
  const filteredFeedLogs = useMemo(() => {
    const list = feedLogs || [];
    const query = (searchQuery || '').trim().toLowerCase();

    return list.filter((log) => {
      if (!log) return false;
      const brandStr = log.feedBrand || '';
      const cropStr = log.cropName || '';
      const tankStr = log.tankName || '';
      const notesStr = log.notes || '';

      const matchesSearch =
        query === '' ||
        brandStr.toLowerCase().includes(query) ||
        cropStr.toLowerCase().includes(query) ||
        tankStr.toLowerCase().includes(query) ||
        notesStr.toLowerCase().includes(query);

      const matchesType = typeFilter === '' || log.feedType === typeFilter;
      const matchesCrop = cropFilter === '' || log.cropId === cropFilter;
      const matchesTank = tankFilter === '' || log.tankId === tankFilter;
      const matchesDate = dateFilter === '' || log.feedingDate === dateFilter;

      return matchesSearch && matchesType && matchesCrop && matchesTank && matchesDate;
    });
  }, [feedLogs, searchQuery, typeFilter, cropFilter, tankFilter, dateFilter]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingFeedLog(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (log) => {
    setEditingFeedLog(log);
    setIsFormOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleOpenDetails = (log) => {
    setViewingFeedLog(log);
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = (log) => {
    setDeletingFeedLog(log);
    setIsDeleteOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleSaveFeed = async (formData) => {
    try {
      if (editingFeedLog) {
        await updateFeedLog(editingFeedLog.id, formData);
      } else {
        await addFeedLog(formData);
      }
      setIsFormOpen(false);
      setEditingFeedLog(null);
    } catch (err) {
      console.error('Error saving feed:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingFeedLog) {
      try {
        await deleteFeedLog(deletingFeedLog.id);
        setIsDeleteOpen(false);
        setDeletingFeedLog(null);
      } catch (err) {
        console.error('Error deleting feed log:', err);
      }
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setCropFilter('');
    setTankFilter('');
    setDateFilter('');
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Feed Management"
        subtitle="Monitor daily feed distribution, ration costs, tray consumption logs, and inventory stock."
        badge={<Badge variant="primary">{(feedLogs || []).length} Records</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
            className="font-semibold shadow-xs"
          >
            Record Feed
          </Button>
        }
      />

      {/* 2. TOP DASHBOARD SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Today's Feed</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">
                {safeAnalytics.todaysFeedKg} <span className="text-xs font-normal text-text-secondary">Kg</span>
              </span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Weight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Feed Used</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">
                {(safeAnalytics.totalFeedUsedKg / 1000).toFixed(2)} <span className="text-xs font-normal text-text-secondary">Tons</span>
              </span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Avg Feed / Day</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">
                {safeAnalytics.avgFeedPerDayKg} <span className="text-xs font-normal text-text-secondary">Kg</span>
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
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Feed Cost</span>
              <span className="text-lg font-bold text-emerald-700 tracking-tight">
                ₹{(safeAnalytics.totalFeedCostRupees / 100000).toFixed(2)} <span className="text-xs font-normal text-text-secondary">Lakhs</span>
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. TODAY'S FEEDING SCHEDULE TIMELINE */}
      <FeedSchedule feedLogs={feedLogs || []} />

      {/* 4. SEARCH & MULTI-FILTERS */}
      <FeedFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        cropFilter={cropFilter}
        onCropChange={setCropFilter}
        tankFilter={tankFilter}
        onTankChange={setTankFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        onReset={handleResetFilters}
      />

      {/* 5. FEED CARDS GRID OR EMPTY STATE */}
      {filteredFeedLogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredFeedLogs.map((log) => (
            <FeedCard
              key={log.id}
              feedLog={log}
              onView={handleOpenDetails}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        <Card padding="relaxed" className="border-border/80">
          <EmptyState
            title="No Feed Records Found"
            description={
              searchQuery || typeFilter || cropFilter || tankFilter || dateFilter
                ? "No feed records match your current filter selection. Try resetting filters or choosing a different date."
                : "You haven't recorded any feed logs yet. Click the button below to log your first feeding ration."
            }
            actionLabel={
              searchQuery || typeFilter || cropFilter || tankFilter || dateFilter ? "Reset Filters" : "Record First Feed"
            }
            onAction={
              searchQuery || typeFilter || cropFilter || tankFilter || dateFilter ? handleResetFilters : handleOpenAdd
            }
          />
        </Card>
      )}

      {/* 6. ADD / EDIT FEED MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingFeedLog(null);
        }}
        title={editingFeedLog ? 'Edit Feed Log' : 'Record New Feed Ration'}
        description={
          editingFeedLog
            ? `Update properties for ${editingFeedLog.feedBrand || 'Feed'} ration`
            : 'Select active crop to auto-fill pond and log feed quantity, cost, and stock.'
        }
        size="lg"
      >
        <FeedForm
          initialData={editingFeedLog}
          onSubmit={handleSaveFeed}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingFeedLog(null);
          }}
        />
      </Modal>

      {/* 7. FEED DETAILS MODAL */}
      <FeedDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setViewingFeedLog(null);
        }}
        feedLog={viewingFeedLog}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* 8. DELETE CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingFeedLog(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Feed Record"
        message={
          deletingFeedLog
            ? `Are you sure you want to delete this feed log (${deletingFeedLog.quantityKg || 0} kg ${deletingFeedLog.feedBrand || 'Feed'})? This action cannot be undone.`
            : 'Are you sure you want to delete this feed record?'
        }
        confirmText="Delete Record"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
