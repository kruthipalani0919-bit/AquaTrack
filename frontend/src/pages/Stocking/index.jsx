import React, { useState, useMemo } from 'react';
import {
  Plus,
  ArrowUpRight,
  UtensilsCrossed,
  Stethoscope,
  MapPin,
  Boxes,
  AlertCircle,
  Pencil,
  Trash2
} from 'lucide-react';

import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { Input } from '../../components/Input';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { AddStockForm } from '../../components/AddStockModal';
import { AllocateStockForm } from '../../components/AllocateStockModal';

import { useStocking } from '../../context/StockingContext';
import { useSites } from '../../context/SiteContext';

export default function Stocking() {
  const {
    stockings = [],
    loading,
    error,
    addStock,
    updateStock,
    deleteStock,
    allocateStock,
    updateAllocation,
    deleteAllocation
  } = useStocking();
  const { sites = [], loading: sitesLoading } = useSites();

  // Modal & Action states
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit/Delete Stock States
  const [editingStock, setEditingStock] = useState(null);
  const [editingStockQuantity, setEditingStockQuantity] = useState('');
  const [deletingStockId, setDeletingStockId] = useState(null);

  // Edit/Delete Site Allocation States
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [editingAllocatedQuantity, setEditingAllocatedQuantity] = useState('');
  const [deletingAllocationId, setDeletingAllocationId] = useState(null);

  // Group Farm Stock Overview by Category (FEED & MEDICINE)
  const farmStockOverview = useMemo(() => {
    const feedItem = stockings.find((s) => s.category?.toUpperCase() === 'FEED');
    const medicineItem = stockings.find((s) => s.category?.toUpperCase() === 'MEDICINE');

    return {
      feed: feedItem
        ? {
            id: feedItem.id,
            category: 'FEED',
            totalQuantity: feedItem.totalQuantity ?? 0,
            totalAllocated: feedItem.totalAllocated ?? 0,
            totalUsed: feedItem.totalUsed ?? 0,
            totalRemaining: feedItem.totalRemaining ?? 0,
            unallocatedQuantity: feedItem.unallocatedQuantity ?? 0,
            unit: feedItem.unit || 'kg',
          }
        : null,
      medicine: medicineItem
        ? {
            id: medicineItem.id,
            category: 'MEDICINE',
            totalQuantity: medicineItem.totalQuantity ?? 0,
            totalAllocated: medicineItem.totalAllocated ?? 0,
            totalUsed: medicineItem.totalUsed ?? 0,
            totalRemaining: medicineItem.totalRemaining ?? 0,
            unallocatedQuantity: medicineItem.unallocatedQuantity ?? 0,
            unit: medicineItem.unit || 'L',
          }
        : null,
    };
  }, [stockings]);

  // Aggregate Site-Wise Stock Data directly from backend siteStock arrays
  const siteWiseStockMap = useMemo(() => {
    const map = {};

    sites.forEach((site) => {
      map[site.id] = {
        site,
        feed: null,
        medicine: null,
      };
    });

    stockings.forEach((stocking) => {
      const category = stocking.category?.toUpperCase();
      const unit = stocking.unit || (category === 'MEDICINE' ? 'L' : 'kg');

      if (Array.isArray(stocking.siteStock)) {
        stocking.siteStock.forEach((ss) => {
          const sId = ss.site?.id || ss.siteId;
          if (sId && map[sId]) {
            if (category === 'FEED') {
              map[sId].feed = {
                allocationId: ss.allocationId || ss.id,
                stockingId: stocking.id,
                allocated: ss.allocatedQuantity ?? 0,
                used: ss.usedQuantity ?? 0,
                remaining: ss.remainingQuantity ?? 0,
                unit,
              };
            } else if (category === 'MEDICINE') {
              map[sId].medicine = {
                allocationId: ss.allocationId || ss.id,
                stockingId: stocking.id,
                allocated: ss.allocatedQuantity ?? 0,
                used: ss.usedQuantity ?? 0,
                remaining: ss.remainingQuantity ?? 0,
                unit,
              };
            }
          }
        });
      }
    });

    return Object.values(map);
  }, [sites, stockings]);

  // Submit Handlers
  const handleAddStockSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await addStock(formData);
      setIsAddStockOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAllocateSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await allocateStock(formData);
      setIsAllocateOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit & Delete Stock Handlers
  const handleOpenEditStock = (stockItem) => {
    setEditingStock(stockItem);
    setEditingStockQuantity(String(stockItem.totalQuantity));
  };

  const handleUpdateStockSubmit = async (e) => {
    e.preventDefault();
    if (!editingStock) return;
    setIsSubmitting(true);
    try {
      await updateStock(editingStock.id, {
        totalQuantity: editingStockQuantity,
        unit: editingStock.unit,
      });
      setEditingStock(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeleteStock = async () => {
    if (!deletingStockId) return;
    setIsDeleting(true);
    try {
      await deleteStock(deletingStockId);
      setDeletingStockId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Edit & Delete Site Allocation Handlers
  const handleOpenEditAllocation = (allocData) => {
    setEditingAllocation(allocData);
    setEditingAllocatedQuantity(String(allocData.allocatedQuantity));
  };

  const handleUpdateAllocationSubmit = async (e) => {
    e.preventDefault();
    if (!editingAllocation) return;
    setIsSubmitting(true);
    try {
      await updateAllocation(editingAllocation.allocationId, {
        allocatedQuantity: editingAllocatedQuantity,
      });
      setEditingAllocation(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeleteAllocation = async () => {
    if (!deletingAllocationId) return;
    setIsDeleting(true);
    try {
      await deleteAllocation(deletingAllocationId);
      setDeletingAllocationId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasAnyStock = Boolean(farmStockOverview.feed || farmStockOverview.medicine);

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Stocking Management"
        subtitle="Manage farm-level stock inventory and allocate feed and medicine to your sites."
        actions={
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAllocateOpen(true)}
              icon={<ArrowUpRight className="w-4 h-4 text-primary" />}
              className="font-semibold shadow-xs"
              disabled={!hasAnyStock || sites.length === 0}
            >
              Allocate Stock
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddStockOpen(true)}
              icon={<Plus className="w-4 h-4" />}
              className="font-semibold shadow-xs"
            >
              Add Stock
            </Button>
          </div>
        }
      />

      {/* COMPACT ERROR DISPLAY BANNER */}
      {error && (
        <Card padding="compact" className="border-danger/30 bg-danger-light/20 text-danger text-xs flex items-center gap-2 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </Card>
      )}

      {/* LOADING SPINNER */}
      {loading && !hasAnyStock ? (
        <div className="py-12 flex justify-center items-center">
          <Loader size="lg" text="Loading stocking inventory..." />
        </div>
      ) : (
        <>
          {/* 2. FARM STOCK OVERVIEW SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div>
                <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                  <Boxes className="w-4.5 h-4.5 text-primary" /> Farm Stock Overview
                </h3>
                <span className="text-xs text-text-secondary">Farm-wide aggregated inventory</span>
              </div>
            </div>

            {hasAnyStock ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* FEED STOCK CARD */}
                <Card padding="normal" className="border-border/80 bg-surface shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Card Header */}
                    <div className="flex items-start justify-between pb-3 border-b border-border/60">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-xs">
                          <UtensilsCrossed className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-text-primary tracking-tight">Feed Stock</h4>
                          <span className="text-xs text-text-secondary">Pellets & Feed Additives</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={farmStockOverview.feed ? 'success' : 'neutral'} size="sm">
                          {farmStockOverview.feed ? 'In Stock' : 'No Stock'}
                        </Badge>
                        {farmStockOverview.feed && (
                          <div className="flex items-center gap-1 border-l border-border/60 pl-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditStock(farmStockOverview.feed)}
                              title="Edit Feed Stock"
                              className="p-1.5 text-text-secondary hover:text-primary rounded-lg hover:bg-primary-light transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingStockId(farmStockOverview.feed.id)}
                              title="Delete Feed Stock"
                              className="p-1.5 text-text-secondary hover:text-danger rounded-lg hover:bg-danger-light transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {farmStockOverview.feed ? (
                      <div className="space-y-3">
                        {/* Primary Metric: Total Stock */}
                        <div className="p-3.5 rounded-xl bg-primary-light/30 border border-primary/20 flex items-center justify-between shadow-2xs">
                          <span className="text-xs uppercase font-bold text-primary tracking-wider">
                            Total Stock
                          </span>
                          <span className="text-xl font-black text-text-primary tracking-tight">
                            {farmStockOverview.feed.totalQuantity} <span className="text-xs font-semibold text-text-secondary">{farmStockOverview.feed.unit}</span>
                          </span>
                        </div>

                        {/* Secondary Metrics: Unallocated, Allocated, Used, Remaining */}
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                          <div className="p-2.5 rounded-lg bg-background border border-border/60">
                            <span className="text-[10px] uppercase font-semibold text-text-secondary block">Unallocated</span>
                            <span className="text-sm font-bold text-primary mt-0.5 block">
                              {farmStockOverview.feed.unallocatedQuantity} <span className="text-[10px] font-normal text-text-secondary">{farmStockOverview.feed.unit}</span>
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-background border border-border/60">
                            <span className="text-[10px] uppercase font-semibold text-text-secondary block">Allocated</span>
                            <span className="text-sm font-bold text-teal-700 mt-0.5 block">
                              {farmStockOverview.feed.totalAllocated} <span className="text-[10px] font-normal text-text-secondary">{farmStockOverview.feed.unit}</span>
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-background border border-border/60">
                            <span className="text-[10px] uppercase font-semibold text-text-secondary block">Used</span>
                            <span className="text-sm font-bold text-amber-700 mt-0.5 block">
                              {farmStockOverview.feed.totalUsed} <span className="text-[10px] font-normal text-text-secondary">{farmStockOverview.feed.unit}</span>
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-background border border-border/60">
                            <span className="text-[10px] uppercase font-semibold text-text-secondary block">Remaining</span>
                            <span className="text-sm font-bold text-emerald-700 mt-0.5 block">
                              {farmStockOverview.feed.totalRemaining} <span className="text-[10px] font-normal text-text-secondary">{farmStockOverview.feed.unit}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-text-secondary">
                        No feed stock recorded yet at farm level.
                      </div>
                    )}
                  </div>
                </Card>

                {/* MEDICINE STOCK CARD */}
                <Card padding="normal" className="border-border/80 bg-surface shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Card Header */}
                    <div className="flex items-start justify-between pb-3 border-b border-border/60">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 shadow-xs">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-text-primary tracking-tight">Medicine Stock</h4>
                          <span className="text-xs text-text-secondary">Probiotics & Sanitizers</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={farmStockOverview.medicine ? 'primary' : 'neutral'} size="sm">
                          {farmStockOverview.medicine ? 'In Stock' : 'No Stock'}
                        </Badge>
                        {farmStockOverview.medicine && (
                          <div className="flex items-center gap-1 border-l border-border/60 pl-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditStock(farmStockOverview.medicine)}
                              title="Edit Medicine Stock"
                              className="p-1.5 text-text-secondary hover:text-primary rounded-lg hover:bg-primary-light transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingStockId(farmStockOverview.medicine.id)}
                              title="Delete Medicine Stock"
                              className="p-1.5 text-text-secondary hover:text-danger rounded-lg hover:bg-danger-light transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {farmStockOverview.medicine ? (
                      <div className="space-y-3">
                        {/* Primary Metric: Total Stock */}
                        <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-200/60 flex items-center justify-between shadow-2xs">
                          <span className="text-xs uppercase font-bold text-cyan-700 tracking-wider">
                            Total Stock
                          </span>
                          <span className="text-xl font-black text-text-primary tracking-tight">
                            {farmStockOverview.medicine.totalQuantity} <span className="text-xs font-semibold text-text-secondary">{farmStockOverview.medicine.unit}</span>
                          </span>
                        </div>

                        {/* Secondary Metrics: Unallocated, Allocated, Used, Remaining */}
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                          <div className="p-2.5 rounded-lg bg-background border border-border/60">
                            <span className="text-[10px] uppercase font-semibold text-text-secondary block">Unallocated</span>
                            <span className="text-sm font-bold text-primary mt-0.5 block">
                              {farmStockOverview.medicine.unallocatedQuantity} <span className="text-[10px] font-normal text-text-secondary">{farmStockOverview.medicine.unit}</span>
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-background border border-border/60">
                            <span className="text-[10px] uppercase font-semibold text-text-secondary block">Allocated</span>
                            <span className="text-sm font-bold text-cyan-700 mt-0.5 block">
                              {farmStockOverview.medicine.totalAllocated} <span className="text-[10px] font-normal text-text-secondary">{farmStockOverview.medicine.unit}</span>
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-background border border-border/60">
                            <span className="text-[10px] uppercase font-semibold text-text-secondary block">Used</span>
                            <span className="text-sm font-bold text-amber-700 mt-0.5 block">
                              {farmStockOverview.medicine.totalUsed} <span className="text-[10px] font-normal text-text-secondary">{farmStockOverview.medicine.unit}</span>
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-background border border-border/60">
                            <span className="text-[10px] uppercase font-semibold text-text-secondary block">Remaining</span>
                            <span className="text-sm font-bold text-emerald-700 mt-0.5 block">
                              {farmStockOverview.medicine.totalRemaining} <span className="text-[10px] font-normal text-text-secondary">{farmStockOverview.medicine.unit}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-text-secondary">
                        No medicine stock recorded yet at farm level.
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ) : (
              <Card padding="relaxed" className="border-border/80">
                <EmptyState
                  title="No Stock Available Yet"
                  description="Add farm-level stock to get started with inventory tracking and site allocation."
                  actionLabel="Add Farm Stock"
                  onAction={() => setIsAddStockOpen(true)}
                />
              </Card>
            )}
          </div>

          {/* 3. SITE-WISE STOCK SECTION */}
          <div className="space-y-4 pt-4 border-t border-border/80">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div>
                <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                  <MapPin className="w-4.5 h-4.5 text-primary" /> Site-wise Stock
                </h3>
                <span className="text-xs text-text-secondary">Site-specific stock allocations & consumption</span>
              </div>
            </div>

            {siteWiseStockMap.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {siteWiseStockMap.map(({ site, feed, medicine }) => {
                  const hasSiteStock = Boolean(feed || medicine);

                  return (
                    <Card key={site.id} padding="normal" className="border-border/80 bg-surface shadow-xs flex flex-col justify-between">
                      <div className="space-y-4">
                        {/* Site Header */}
                        <div className="flex items-start justify-between pb-3 border-b border-border/60">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0 shadow-xs">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm sm:text-base text-text-primary">{site.siteName}</h4>
                              <span className="text-xs text-text-secondary">{site.location}</span>
                            </div>
                          </div>
                          <Badge variant={hasSiteStock ? 'success' : 'neutral'} size="sm">
                            {hasSiteStock ? 'Stock Allocated' : 'No Allocation'}
                          </Badge>
                        </div>

                        {hasSiteStock ? (
                          <div className="space-y-3">
                            {/* FEED ALLOCATION FOR SITE */}
                            {feed ? (
                              <div className="p-3 rounded-xl bg-background border border-border/60 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                                    <UtensilsCrossed className="w-3.5 h-3.5 text-teal-600" /> Feed
                                  </span>
                                  <span className="text-[11px] text-text-secondary font-semibold">
                                    Allocated: <strong className="text-text-primary">{feed.allocated} {feed.unit}</strong>
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                  <div className="p-1.5 rounded-lg bg-surface border border-border/40">
                                    <span className="text-[10px] text-text-secondary block font-medium">Used</span>
                                    <span className="font-bold text-amber-700">{feed.used} {feed.unit}</span>
                                  </div>
                                  <div className="p-1.5 rounded-lg bg-surface border border-border/40">
                                    <span className="text-[10px] text-text-secondary block font-medium">Remaining</span>
                                    <span className="font-bold text-emerald-700">{feed.remaining} {feed.unit}</span>
                                  </div>
                                </div>

                                {/* EDIT & DELETE OPTIONS FOR FEED ALLOCATION AT BOTTOM */}
                                {feed.allocationId && (
                                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditAllocation({
                                        allocationId: feed.allocationId,
                                        siteName: site.siteName,
                                        category: 'Feed',
                                        allocatedQuantity: feed.allocated,
                                        unit: feed.unit,
                                      })}
                                      className="text-xs text-primary hover:text-primary-dark font-semibold flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md hover:bg-primary-light/50 transition-colors"
                                    >
                                      <Pencil className="w-3 h-3" /> Edit Allocation
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeletingAllocationId(feed.allocationId)}
                                      className="text-xs text-danger hover:text-danger-dark font-semibold flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md hover:bg-danger-light/50 transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" /> Delete Allocation
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : null}

                            {/* MEDICINE ALLOCATION FOR SITE */}
                            {medicine ? (
                              <div className="p-3 rounded-xl bg-background border border-border/60 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                                    <Stethoscope className="w-3.5 h-3.5 text-cyan-600" /> Medicine
                                  </span>
                                  <span className="text-[11px] text-text-secondary font-semibold">
                                    Allocated: <strong className="text-text-primary">{medicine.allocated} {medicine.unit}</strong>
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                  <div className="p-1.5 rounded-lg bg-surface border border-border/40">
                                    <span className="text-[10px] text-text-secondary block font-medium">Used</span>
                                    <span className="font-bold text-amber-700">{medicine.used} {medicine.unit}</span>
                                  </div>
                                  <div className="p-1.5 rounded-lg bg-surface border border-border/40">
                                    <span className="text-[10px] text-text-secondary block font-medium">Remaining</span>
                                    <span className="font-bold text-emerald-700">{medicine.remaining} {medicine.unit}</span>
                                  </div>
                                </div>

                                {/* EDIT & DELETE OPTIONS FOR MEDICINE ALLOCATION AT BOTTOM */}
                                {medicine.allocationId && (
                                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditAllocation({
                                        allocationId: medicine.allocationId,
                                        siteName: site.siteName,
                                        category: 'Medicine',
                                        allocatedQuantity: medicine.allocated,
                                        unit: medicine.unit,
                                      })}
                                      className="text-xs text-primary hover:text-primary-dark font-semibold flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md hover:bg-primary-light/50 transition-colors"
                                    >
                                      <Pencil className="w-3 h-3" /> Edit Allocation
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeletingAllocationId(medicine.allocationId)}
                                      className="text-xs text-danger hover:text-danger-dark font-semibold flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md hover:bg-danger-light/50 transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" /> Delete Allocation
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <div className="py-4 text-center text-xs text-text-secondary bg-background/50 rounded-xl border border-dashed border-border/60">
                            No stock allocated to this site yet.
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card padding="relaxed" className="border-border/80">
                <EmptyState
                  title="No Sites Created"
                  description="You need to create a site before allocating farm stock."
                />
              </Card>
            )}
          </div>
        </>
      )}

      {/* 4. ADD STOCK MODAL */}
      <Modal
        isOpen={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
        title="Add Farm Stock"
        description="Record new feed or medicine inventory received at the farm level."
        size="md"
      >
        <AddStockForm
          onSubmit={handleAddStockSubmit}
          onCancel={() => setIsAddStockOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* 5. EDIT FARM STOCK MODAL */}
      <Modal
        isOpen={Boolean(editingStock)}
        onClose={() => setEditingStock(null)}
        title={`Edit ${editingStock?.category === 'FEED' ? 'Feed' : 'Medicine'} Stock`}
        description="Update total farm stock inventory quantity."
        size="md"
      >
        {editingStock && (
          <form onSubmit={handleUpdateStockSubmit} className="space-y-4">
            <Input
              label={`Total Quantity (${editingStock.unit}) *`}
              type="number"
              min="0.1"
              step="0.01"
              required
              value={editingStockQuantity}
              onChange={(e) => setEditingStockQuantity(e.target.value)}
              placeholder="e.g. 100"
            />
            <div className="text-xs text-text-secondary">
              Already Allocated: <strong>{editingStock.totalAllocated} {editingStock.unit}</strong>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingStock(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Stock'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 6. DELETE FARM STOCK CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={Boolean(deletingStockId)}
        onClose={() => setDeletingStockId(null)}
        onConfirm={handleConfirmDeleteStock}
        title="Delete Farm Stock Record"
        message="Are you sure you want to delete this farm stock record? All site allocations associated with this stock will also be removed."
        confirmText={isDeleting ? 'Deleting...' : 'Delete Stock'}
        confirmVariant="danger"
        isLoading={isDeleting}
      />

      {/* 7. ALLOCATE STOCK MODAL */}
      <Modal
        isOpen={isAllocateOpen}
        onClose={() => setIsAllocateOpen(false)}
        title="Allocate Stock to Site"
        description="Transfer farm stock inventory to a specific site."
        size="md"
      >
        <AllocateStockForm
          onSubmit={handleAllocateSubmit}
          onCancel={() => setIsAllocateOpen(false)}
          isSubmitting={isSubmitting}
          availableStockings={stockings}
        />
      </Modal>

      {/* 8. EDIT SITE STOCK ALLOCATION MODAL */}
      <Modal
        isOpen={Boolean(editingAllocation)}
        onClose={() => setEditingAllocation(null)}
        title="Edit Site Stock Allocation"
        description={`Update allocated quantity for ${editingAllocation?.siteName || 'Site'} (${editingAllocation?.category || 'Stock'}).`}
        size="md"
      >
        {editingAllocation && (
          <form onSubmit={handleUpdateAllocationSubmit} className="space-y-4">
            <Input
              label={`Allocated Quantity (${editingAllocation.unit}) *`}
              type="number"
              min="0.1"
              step="0.01"
              required
              value={editingAllocatedQuantity}
              onChange={(e) => setEditingAllocatedQuantity(e.target.value)}
              placeholder="e.g. 50"
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingAllocation(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Allocation'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 9. DELETE SITE STOCK ALLOCATION CONFIRMATION DIALOG */}
      <ConfirmationDialog
        isOpen={Boolean(deletingAllocationId)}
        onClose={() => setDeletingAllocationId(null)}
        onConfirm={handleConfirmDeleteAllocation}
        title="Remove Stock Allocation"
        message="Are you sure you want to remove this stock allocation from the site?"
        confirmText={isDeleting ? 'Deleting...' : 'Remove Allocation'}
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
