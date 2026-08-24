import React, { useState, useMemo, useEffect } from 'react';
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
import { useTanks } from '../../context/TankContext';
import { subscribeToSyncBus } from '../../utils/syncBus';

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

  const { tanks = [] } = useTanks();

  // Filter State (Tank & Date filters retained)
  const [tankFilter, setTankFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modal Control States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFeedLog, setEditingFeedLog] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingFeedLog, setViewingFeedLog] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingFeedLog, setDeletingFeedLog] = useState(null);

  // Automatically reset tankFilter if the selected tank was deleted
  useEffect(() => {
    if (tankFilter && tanks.length > 0) {
      const exists = tanks.some((t) => String(t.id) === String(tankFilter));
      if (!exists) {
        setTankFilter('');
      }
    }
  }, [tanks, tankFilter]);

  // Subscribe to sync bus events for reactive modal cleanup
  useEffect(() => {
    const unsubscribe = subscribeToSyncBus((detail) => {
      if (detail.action === 'DELETE') {
        if (detail.entityType === 'TANK' && detail.payload?.tankId === tankFilter) {
          setTankFilter('');
        }
        if (detail.entityType === 'FEED' && detail.payload?.id) {
          const fId = String(detail.payload.id);
          if (viewingFeedLog && String(viewingFeedLog.id) === fId) {
            setIsDetailsOpen(false);
            setViewingFeedLog(null);
          }
          if (deletingFeedLog && String(deletingFeedLog.id) === fId) {
            setIsDeleteOpen(false);
            setDeletingFeedLog(null);
          }
          if (editingFeedLog && String(editingFeedLog.id) === fId) {
            setIsFormOpen(false);
            setEditingFeedLog(null);
          }
        }
      }
    });
    return unsubscribe;
  }, [tankFilter, viewingFeedLog, deletingFeedLog, editingFeedLog]);

  const safeAnalytics = {
    todaysFeedKg: analytics?.todaysFeedKg || 0,
    totalFeedUsedKg: analytics?.totalFeedUsedKg || 0,
    totalFeedCostRupees: analytics?.totalFeedCostRupees || 0,
  };

  // Filter Logic (Tank & Date matching)
  const filteredFeedLogs = useMemo(() => {
    const list = feedLogs || [];

    return list.filter((log) => {
      if (!log) return false;
      const matchesTank = tankFilter === '' || String(log.tankId) === String(tankFilter);
      const matchesDate = dateFilter === '' || log.feedingDate === dateFilter || log.date === dateFilter;

      return matchesTank && matchesDate;
    });
  }, [feedLogs, tankFilter, dateFilter]);

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
        console.error('Error deleting feed:', err);
      }
    }
  };

  const handleResetFilters = () => {
    setTankFilter('');
    setDateFilter('');
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Feed Management"
        subtitle="Log daily feed rations, track feed types, and monitor overall feed cost expenditure."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
            className="font-semibold shadow-xs"
          >
            Record Feed Log
          </Button>
        }
      />

      {/* 2. FEED SUMMARY ANALYTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Weight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Today's Feed</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{safeAnalytics.todaysFeedKg.toLocaleString()} kg</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Feed Used</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{safeAnalytics.totalFeedUsedKg.toLocaleString()} kg</span>
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
              <span className="text-lg font-bold text-text-primary tracking-tight">₹{safeAnalytics.totalFeedCostRupees.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. FEED FILTERS BAR */}
      <FeedFilters
        tankFilter={tankFilter}
        onTankFilterChange={setTankFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onResetFilters={handleResetFilters}
      />

      {/* 4. FEED LOGS GRID OR EMPTY STATE */}
      {loading ? (
        <div className="py-16 text-center">
          <span className="text-xs font-semibold text-text-secondary">Loading feeding logs...</span>
        </div>
      ) : filteredFeedLogs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredFeedLogs.map((log) => (
            <FeedCard
              key={log.id}
              log={log}
              onViewDetails={() => handleOpenDetails(log)}
              onEdit={() => handleOpenEdit(log)}
              onDelete={() => handleOpenDelete(log)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={tankFilter || dateFilter ? "No matching feed records" : "No feed logs recorded"}
          description={
            tankFilter || dateFilter
              ? "Try clearing your tank or date filter to view other feeding logs."
              : "Record daily feed rations to monitor feed conversion rates and daily feeding expenditure."
          }
          actionLabel={tankFilter || dateFilter ? "Reset Filters" : "Record Feed Log"}
          onAction={tankFilter || dateFilter ? handleResetFilters : handleOpenAdd}
        />
      )}

      {/* 5. ADD / EDIT FEED FORM MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingFeedLog ? "Edit Feed Log" : "Record Feed Allocation"}
        maxWidth="max-w-md"
      >
        <FeedForm
          initialData={editingFeedLog}
          onSubmit={handleSaveFeed}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* 6. VIEW FEED DETAILS MODAL */}
      {viewingFeedLog && (
        <FeedDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          log={viewingFeedLog}
          onEdit={() => handleOpenEdit(viewingFeedLog)}
        />
      )}

      {/* 7. DELETE FEED LOG CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Feed Log"
        message={`Are you sure you want to delete feed record for "${deletingFeedLog?.feedType || 'Feed'}"? This action cannot be undone.`}
        confirmText="Delete Record"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
