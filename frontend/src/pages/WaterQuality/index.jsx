import React, { useState, useMemo } from 'react';
import {
  Plus,
  Waves,
  Thermometer,
  Activity,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { EmptyState } from '../../components/EmptyState';

import { WaterCard } from '../../components/WaterCard';
import { WaterForm } from '../../components/WaterForm';
import { WaterFilters } from '../../components/WaterFilters';
import { WaterCharts } from '../../components/WaterCharts';
import { WaterDetailsModal } from '../../components/WaterDetailsModal';
import { useWaterQuality } from '../../context/WaterQualityContext';

export default function WaterQuality() {
  const { waterRecords, addWaterRecord, updateWaterRecord, deleteWaterRecord, summaryMetrics } = useWaterQuality();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [tankFilter, setTankFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal Control States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);

  // Multi-Filter Logic
  const filteredRecords = useMemo(() => {
    return waterRecords.filter((rec) => {
      // Search match
      const matchesSearch =
        searchQuery.trim() === '' ||
        rec.tankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rec.notes && rec.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      // Tank match
      const matchesTank = tankFilter === '' || rec.tankId === tankFilter;

      // Date match
      const matchesDate = dateFilter === '' || rec.testDate === dateFilter;

      // Status match
      const matchesStatus = statusFilter === '' || rec.status === statusFilter;

      return matchesSearch && matchesTank && matchesDate && matchesStatus;
    });
  }, [waterRecords, searchQuery, tankFilter, dateFilter, statusFilter]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setIsFormOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleOpenDetails = (rec) => {
    setViewingRecord(rec);
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = (rec) => {
    setDeletingRecord(rec);
    setIsDeleteOpen(true);
    if (isDetailsOpen) setIsDetailsOpen(false);
  };

  const handleSaveWaterRecord = (formData) => {
    if (editingRecord) {
      updateWaterRecord(editingRecord.id, formData);
    } else {
      addWaterRecord(formData);
    }
    setIsFormOpen(false);
    setEditingRecord(null);
  };

  const handleConfirmDelete = () => {
    if (deletingRecord) {
      deleteWaterRecord(deletingRecord.id);
      setIsDeleteOpen(false);
      setDeletingRecord(null);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setTankFilter('');
    setDateFilter('');
    setStatusFilter('');
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Water Quality Management"
        subtitle="Monitor pond parameters, pH trends, dissolved oxygen, and automated safe-range alerts."
        badge={<Badge variant="primary">{waterRecords.length} Records</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
            className="font-semibold shadow-xs"
          >
            Log Water Check
          </Button>
        }
      />

      {/* 2. TOP 5 DASHBOARD SUMMARY CARDS (Requirement 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Today's Water Check */}
        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Today's Checks</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{summaryMetrics.todaysWaterChecks} Logs</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Average pH */}
        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Average pH</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{summaryMetrics.avgPh}</span>
            </div>
          </div>
        </Card>

        {/* Card 3: Average Temperature */}
        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Thermometer className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Average Temp</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">
                {summaryMetrics.avgTemperature} <span className="text-xs font-normal text-text-secondary">°C</span>
              </span>
            </div>
          </div>
        </Card>

        {/* Card 4: Average Dissolved Oxygen */}
        <Card padding="compact" className="border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Average DO</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">
                {summaryMetrics.avgDissolvedOxygen} <span className="text-xs font-normal text-text-secondary">mg/L</span>
              </span>
            </div>
          </div>
        </Card>

        {/* Card 5: Active Alerts */}
        <Card padding="compact" className={`border-border/80 ${summaryMetrics.activeAlerts > 0 ? 'bg-warning-light/30' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${summaryMetrics.activeAlerts > 0 ? 'bg-warning text-white' : 'bg-emerald-50 text-emerald-600'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Active Alerts</span>
              <span className={`text-lg font-bold tracking-tight ${summaryMetrics.activeAlerts > 0 ? 'text-warning' : 'text-text-primary'}`}>
                {summaryMetrics.activeAlerts} <span className="text-xs font-normal text-text-secondary">Alerts</span>
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. RECHARTS PARAMETER TREND CHARTS */}
      <WaterCharts />

      {/* 4. MULTI-FILTERS */}
      <WaterFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        tankFilter={tankFilter}
        onTankChange={setTankFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onReset={handleResetFilters}
      />

      {/* 5. WATER CARDS GRID OR EMPTY STATE */}
      {filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredRecords.map((rec) => (
            <WaterCard
              key={rec.id}
              record={rec}
              onView={handleOpenDetails}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        <Card padding="relaxed" className="border-border/80">
          <EmptyState
            title="No Water Records Found"
            description={
              searchQuery || tankFilter || dateFilter || statusFilter
                ? "No water sampling logs match your current filter selection. Try clearing filters or choosing another date."
                : "You haven't logged any water quality parameters yet. Click the button below to log your first water check."
            }
            actionLabel={
              searchQuery || tankFilter || dateFilter || statusFilter ? "Reset Filters" : "Log First Water Check"
            }
            onAction={
              searchQuery || tankFilter || dateFilter || statusFilter ? handleResetFilters : handleOpenAdd
            }
          />
        </Card>
      )}

      {/* 6. ADD / EDIT WATER RECORD MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRecord(null);
        }}
        title={editingRecord ? 'Edit Water Check Record' : 'Log New Water Quality Check'}
        description={
          editingRecord
            ? `Update properties for ${editingRecord.tankName}`
            : 'Enter water parameters. The system will automatically compute status based on safe ranges.'
        }
        size="lg"
      >
        <WaterForm
          initialData={editingRecord}
          onSubmit={handleSaveWaterRecord}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingRecord(null);
          }}
        />
      </Modal>

      {/* 7. WATER DETAILS MODAL */}
      <WaterDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setViewingRecord(null);
        }}
        record={viewingRecord}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* 8. DELETE CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingRecord(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Water Record"
        message={
          deletingRecord
            ? `Are you sure you want to delete the water check for "${deletingRecord.tankName}" recorded on ${deletingRecord.testDate}? This action cannot be undone.`
            : 'Are you sure you want to delete this water record?'
        }
        confirmText="Delete Record"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
