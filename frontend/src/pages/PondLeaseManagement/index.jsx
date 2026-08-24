import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Landmark, Calendar, IndianRupee, Eye, Trash2, Edit2, CheckCircle2, Clock } from 'lucide-react';

import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { EmptyState } from '../../components/EmptyState';

import { usePondLeases } from '../../context/PondLeaseContext';
import { useTanks } from '../../context/TankContext';

export default function PondLeaseManagement() {
  const navigate = useNavigate();
  const { leases, loading, addLease, updateLease, deleteLease, getLeaseCropAllocations } = usePondLeases();
  const { tanks } = useTanks();

  // Modals & Active View State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLease, setEditingLease] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingLease, setDeletingLease] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedLeaseDetails, setSelectedLeaseDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form inputs state
  const [formData, setFormData] = useState({
    tankId: '',
    totalLeaseAmount: '',
    leaseStartDate: '',
    leaseEndDate: '',
    remarks: '',
  });

  const [formError, setFormError] = useState('');

  // Calculate live days & daily cost for form preview
  const formCalculations = useMemo(() => {
    if (!formData.leaseStartDate || !formData.leaseEndDate || !formData.totalLeaseAmount) {
      return { totalDays: 0, dailyCost: 0 };
    }

    const start = new Date(formData.leaseStartDate);
    const end = new Date(formData.leaseEndDate);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);

    if (end < start) {
      return { totalDays: 0, dailyCost: 0 };
    }

    const diffTime = end.getTime() - start.getTime();
    const totalDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const amount = parseFloat(formData.totalLeaseAmount) || 0;
    const dailyCost = totalDays > 0 ? (amount / totalDays) : 0;

    return { totalDays, dailyCost };
  }, [formData.leaseStartDate, formData.leaseEndDate, formData.totalLeaseAmount]);

  // Open Add Form
  const handleOpenAdd = () => {
    setEditingLease(null);
    setFormData({
      tankId: tanks[0]?.id || '',
      totalLeaseAmount: '',
      leaseStartDate: new Date().toISOString().split('T')[0],
      leaseEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      remarks: '',
    });
    setFormError('');
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (lease) => {
    setEditingLease(lease);
    setFormData({
      tankId: lease.tankId,
      totalLeaseAmount: lease.totalLeaseAmount,
      leaseStartDate: lease.leaseStartDate ? new Date(lease.leaseStartDate).toISOString().split('T')[0] : '',
      leaseEndDate: lease.leaseEndDate ? new Date(lease.leaseEndDate).toISOString().split('T')[0] : '',
      remarks: lease.remarks || '',
    });
    setFormError('');
    setIsFormOpen(true);
  };

  // Save Form Handler
  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.tankId) {
      setFormError('Please select a tank/pond.');
      return;
    }
    const amount = parseFloat(formData.totalLeaseAmount);
    if (!amount || amount <= 0) {
      setFormError('Total lease amount must be greater than 0.');
      return;
    }
    if (!formData.leaseStartDate || !formData.leaseEndDate) {
      setFormError('Please enter both lease start date and end date.');
      return;
    }
    if (new Date(formData.leaseEndDate) < new Date(formData.leaseStartDate)) {
      setFormError('Lease end date cannot be before lease start date.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingLease) {
        await updateLease(editingLease.id, formData);
      } else {
        await addLease(formData);
      }
      setIsFormOpen(false);
      setEditingLease(null);
    } catch (err) {
      setFormError(err.message || 'Failed to save pond lease');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (deletingLease) {
      setIsDeleting(true);
      try {
        await deleteLease(deletingLease.id);
        setIsDeleteOpen(false);
        setDeletingLease(null);
        if (selectedLeaseDetails?.lease?.id === deletingLease.id) {
          setSelectedLeaseDetails(null);
        }
      } catch (err) {
        console.error('Error deleting lease:', err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // View Details Handler
  const handleViewDetails = async (lease) => {
    setDetailsLoading(true);
    try {
      const details = await getLeaseCropAllocations(lease.id);
      setSelectedLeaseDetails(details);
    } catch (err) {
      console.error('Error loading crop allocations:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Pond Lease Management"
        subtitle="Manage tank & pond leases, track daily cost distribution, and view crop-wise cost allocations based on active date overlaps."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/expenses')}
              icon={<ArrowLeft className="w-4 h-4" />}
              className="font-semibold shadow-xs"
            >
              Back to Expenses
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
              icon={<Plus className="w-4 h-4" />}
              className="font-semibold shadow-xs"
            >
              Add New Pond Lease
            </Button>
          </div>
        }
      />

      {/* 2. LEASE SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card padding="compact" className="border-border/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Active Pond Leases</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">{leases.length} Leases</span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Total Lease Outlay</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">
                ₹{leases.reduce((sum, l) => sum + (l.totalLeaseAmount || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        <Card padding="compact" className="border-border/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider block">Assigned Farm Tanks</span>
              <span className="text-lg font-bold text-text-primary tracking-tight">
                {new Set(leases.map((l) => l.tankId)).size} / {tanks.length} Tanks
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. MAIN POND LEASE TABLE */}
      <Card padding="none" className="border-border/80 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-border/80 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-base font-semibold text-text-primary">Pond Leases Overview</h2>
          <span className="text-xs text-text-secondary font-medium">{leases.length} records found</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-text-secondary text-sm">Loading pond leases...</div>
        ) : leases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-text-secondary border-b border-border text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-6">Tank / Pond</th>
                  <th className="py-3 px-6">Lease Amount</th>
                  <th className="py-3 px-6">Start Date</th>
                  <th className="py-3 px-6">End Date</th>
                  <th className="py-3 px-6">Duration</th>
                  <th className="py-3 px-6">Daily Cost</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {leases.map((lease) => (
                  <tr key={lease.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-text-primary">
                      {lease.tank?.tankName || 'Tank'}
                      {lease.tank?.site?.siteName && (
                        <span className="block text-xs font-normal text-text-secondary">
                          {lease.tank.site.siteName}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-700">
                      ₹{(lease.totalLeaseAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-text-secondary">{formatDate(lease.leaseStartDate)}</td>
                    <td className="py-4 px-6 text-text-secondary">{formatDate(lease.leaseEndDate)}</td>
                    <td className="py-4 px-6 font-medium text-text-primary">
                      {lease.totalLeaseDays} Days
                    </td>
                    <td className="py-4 px-6 font-semibold text-teal-700">
                      ₹{Math.round(lease.dailyLeaseCost || 0).toLocaleString()}/day
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewDetails(lease)}
                          icon={<Eye className="w-3.5 h-3.5" />}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(lease)}
                          className="text-text-secondary hover:text-text-primary p-1.5"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingLease(lease);
                            setIsDeleteOpen(true);
                          }}
                          className="text-red-500 hover:text-red-700 p-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title="No Pond Leases Configured"
              description="Add a lease duration and total lease cost for your farm tanks to automatically compute daily and crop-wise lease cost allocation."
              actionLabel="Add New Pond Lease"
              onAction={handleOpenAdd}
            />
          </div>
        )}
      </Card>

      {/* 4. DETAILED CROP-WISE LEASE ALLOCATION VIEW */}
      {selectedLeaseDetails && (
        <Card padding="relaxed" className="border-emerald-200 bg-emerald-50/10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="md">Tank Lease Allocation</Badge>
                <h3 className="text-xl font-bold text-text-primary">
                  {selectedLeaseDetails.lease?.tank?.tankName || 'Selected Tank'}
                </h3>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Lease Period: {formatDate(selectedLeaseDetails.lease?.leaseStartDate)} → {formatDate(selectedLeaseDetails.lease?.leaseEndDate)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedLeaseDetails(null)}
            >
              Close Details
            </Button>
          </div>

          {/* Lease Summary Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white rounded-xl border border-border/80 shadow-2xs">
            <div>
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">Total Lease Amount</span>
              <span className="text-base font-bold text-text-primary">
                ₹{(selectedLeaseDetails.lease?.totalLeaseAmount || 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">Total Lease Days</span>
              <span className="text-base font-bold text-text-primary">
                {selectedLeaseDetails.totalLeaseDays} Days
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">Daily Lease Cost</span>
              <span className="text-base font-bold text-teal-700">
                ₹{Math.round(selectedLeaseDetails.dailyLeaseCost || 0).toLocaleString()} / day
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">Associated Crops</span>
              <span className="text-base font-bold text-text-primary">
                {selectedLeaseDetails.cropAllocations?.length || 0} Crops
              </span>
            </div>
          </div>

          {/* Detailed Crop Allocation Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Crop-Wise Cost Allocation Table
            </h4>

            {selectedLeaseDetails.cropAllocations?.length > 0 ? (
              <div className="overflow-x-auto bg-white rounded-xl border border-border/80">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-text-secondary border-b border-border text-[11px] uppercase tracking-wider font-semibold">
                      <th className="py-3 px-6">Crop / Batch</th>
                      <th className="py-3 px-6">Stocking Date</th>
                      <th className="py-3 px-6">Crop Status</th>
                      <th className="py-3 px-6">Crop End Date / Today</th>
                      <th className="py-3 px-6">Overlapping Days</th>
                      <th className="py-3 px-6">Allocated Lease Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {selectedLeaseDetails.cropAllocations.map((crop) => (
                      <tr key={crop.cropId} className="hover:bg-gray-50/50">
                        <td className="py-4 px-6 font-semibold text-text-primary">
                          {crop.cropName}
                          <span className="block text-xs font-normal text-text-secondary">
                            Seed: {crop.seedVariety}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-text-secondary">{formatDate(crop.stockingDate)}</td>
                        <td className="py-4 px-6">
                          {crop.cropStatus === 'ACTIVE' ? (
                            <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3" />}>ACTIVE</Badge>
                          ) : (
                            <Badge variant="neutral" icon={<Clock className="w-3 h-3" />}>COMPLETED</Badge>
                          )}
                        </td>
                        <td className="py-4 px-6 font-medium text-text-primary">
                          {crop.cropStatus === 'ACTIVE' ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              Today ({formatDate(crop.cropEndDate)})
                            </span>
                          ) : (
                            formatDate(crop.cropEndDate)
                          )}
                        </td>
                        <td className="py-4 px-6 font-bold text-text-primary">
                          {crop.overlappingDays} Days
                        </td>
                        <td className="py-4 px-6 font-bold text-emerald-700 text-base">
                          ₹{crop.allocatedLeaseCost.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl border border-border/80 text-center text-text-secondary text-sm">
                No crops logged for this tank during the lease period.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 5. ADD / EDIT POND LEASE MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingLease ? 'Edit Pond Lease' : 'Add Pond Lease'}
        description="Configure pond lease period and total amount to calculate daily and crop lease cost allocation."
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
              Select Tank / Pond *
            </label>
            <select
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.tankId}
              onChange={(e) => setFormData({ ...formData, tankId: e.target.value })}
              required
            >
              {tanks.map((tank) => (
                <option key={tank.id} value={tank.id}>
                  {tank.name || tank.tankName} {tank.site?.siteName ? `(${tank.site.siteName})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
              Total Lease Amount (₹) *
            </label>
            <input
              type="number"
              min="1"
              step="any"
              placeholder="e.g. 365000"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.totalLeaseAmount}
              onChange={(e) => setFormData({ ...formData, totalLeaseAmount: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Lease Start Date *
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={formData.leaseStartDate}
                onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Lease End Date *
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={formData.leaseEndDate}
                onChange={(e) => setFormData({ ...formData, leaseEndDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Live Calculated Duration & Daily Cost Preview */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-border/80 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-text-secondary font-medium block">Total Duration:</span>
              <span className="text-sm font-bold text-text-primary">{formCalculations.totalDays} Days</span>
            </div>
            <div>
              <span className="text-text-secondary font-medium block">Calculated Daily Cost:</span>
              <span className="text-sm font-bold text-teal-700">₹{Math.round(formCalculations.dailyCost).toLocaleString()} / day</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
              Remarks / Notes (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="Add optional notes or remarks..."
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFormOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {editingLease ? (isSubmitting ? 'Updating...' : 'Update Lease Record') : (isSubmitting ? 'Saving...' : 'Save Pond Lease')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. DELETE CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingLease(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Pond Lease"
        message={
          deletingLease
            ? `Are you sure you want to delete the lease record for "${deletingLease.tank?.tankName || 'this tank'}"? This action cannot be undone.`
            : 'Are you sure you want to delete this lease record?'
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete Lease'}
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
