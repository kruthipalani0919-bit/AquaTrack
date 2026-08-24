import React, { useState, useMemo } from 'react';
import {
  Plus,
  UtensilsCrossed,
  Weight,
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
import { FeedDetailsModal } from '../../components/FeedDetailsModal';
import { useFeed } from '../../context/FeedContext';

export default function FeedManagement() {
  const {
    feedLogs = [],
    addFeedLog,
    updateFeedLog,
    deleteFeedLog,
    analytics = { todaysFeedKg: 0, totalFeedUsedKg: 0, totalFeedCostRupees: 0 },
    loading,
    error
  } = useFeed();

  // Filter State (Tank & Date filters retained)
  const [tankFilter, setTankFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modal Control States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFeedLog, setEditingFeedLog] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingFeedLog, setViewingFeedLog] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingFeedLog, setDeletingFeedLog] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const safeAnalytics = {
    todaysFeedKg: analytics?.todaysFeedKg || 0,
    totalFeedUsedKg: analytics?.totalFeedUsedKg || 0,
    totalFeedCostRupees: analytics?.totalFeedCostRupees || 0,
  };

  // Filter Feed Logs
  const filteredFeedLogs = useMemo(() => {
    const list = feedLogs || [];
    return list.filter((log) => {
      if (!log) return false;
      const matchesTank = tankFilter === '' || log.tankId === tankFilter;

      let matchesDate = true;
      if (dateFilter) {
        const logDateStr = log.date ? new Date(log.date).toISOString().split('T')[0] : '';
        matchesDate = logDateStr === dateFilter;
      }

      return matchesTank && matchesDate;
    });
  }, [feedLogs, tankFilter, dateFilter]);

  // Form Handlers
  const handleOpenAdd = () => {
    setEditingFeedLog(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (feedLog) => {
    setEditingFeedLog(feedLog);
    setIsFormOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleOpenDetails = (feedLog) => {
    setViewingFeedLog(feedLog);
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = (feedLog) => {
    setDeletingFeedLog(feedLog);
    setIsDeleteOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleSaveFeed = async (formData) => {
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingFeedLog) {
      setIsDeleting(true);
      try {
        await deleteFeedLog(deletingFeedLog.id);
        setIsDeleteOpen(false);
        setDeletingFeedLog(null);
      } catch (err) {
        console.error('Error deleting feed log:', err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleResetFilters = () => {
    setTankFilter('');
    setDateFilter('');
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER (Records badge removed as requested) */}
      <PageHeader
        title="Feed Management"
        subtitle="Monitor daily feed distribution, ration logs, and total feed expenditure."
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

      {/* 2. TOP DASHBOARD SUMMARY CARDS (Today's Feed, Total Feed Used, Total Feed Cost) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Used Today</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{safeAnalytics.todaysFeedKg} kg</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Weight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Feed Used</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{safeAnalytics.totalFeedUsedKg} kg</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Feed Cost</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">₹{safeAnalytics.totalFeedCostRupees.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. FILTERS AREA (All Tanks & Date Picker) */}
      <FeedFilters
        tankFilter={tankFilter}
        onTankChange={setTankFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        onReset={handleResetFilters}
      />

      {/* 4. FEED CARDS GRID OR EMPTY STATE */}
      {filteredFeedLogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredFeedLogs.map((log) => (
            <FeedCard
              key={log.id}
              feedLog={log}
              onViewDetails={handleOpenDetails}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        <Card padding="relaxed" className="border-border/80 shadow-2xs">
          <EmptyState
            title="No Feed Records Found"
            description={
              tankFilter || dateFilter
                ? "No feed distribution logs match your current filter criteria. Try resetting filters."
                : "No feed distribution logs recorded yet."
            }
            actionLabel={
              tankFilter || dateFilter ? "Reset Filters" : "Record Feed"
            }
            onAction={
              tankFilter || dateFilter ? handleResetFilters : handleOpenAdd
            }
          />
        </Card>
      )}

      {/* 5. ADD / EDIT FEED MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingFeedLog(null);
        }}
        title={editingFeedLog ? 'Edit Feed Log' : 'Record Feed'}
        description={
          editingFeedLog
            ? `Update feed record for ${editingFeedLog.feedBrand || 'Feed'}`
            : 'Record daily feed distribution into a tank.'
        }
        size="md"
      >
        <FeedForm
          initialData={editingFeedLog}
          onSubmit={handleSaveFeed}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingFeedLog(null);
          }}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* 6. VIEW FEED DETAILS MODAL */}
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

      {/* 7. DELETE CONFIRMATION DIALOG */}
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
            ? `Are you sure you want to delete feed record for "${deletingFeedLog.feedBrand || 'Feed'}"? This action cannot be undone.`
            : 'Are you sure you want to delete this feed record?'
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete Feed Record'}
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
