import React, { useState, useMemo } from 'react';
import {
  Plus,
  ArrowUpRight,
  UtensilsCrossed,
  Stethoscope,
  MapPin,
  Boxes,
  AlertCircle,
  PackageCheck
} from 'lucide-react';

import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';
import { AddStockForm } from '../../components/AddStockModal';
import { AllocateStockForm } from '../../components/AllocateStockModal';

import { useStocking } from '../../context/StockingContext';
import { useSites } from '../../context/SiteContext';

export default function Stocking() {
  const { stockings = [], loading, error, addStock, allocateStock } = useStocking();
  const { sites = [], loading: sitesLoading } = useSites();

  // Modal states
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [selectedStockRecord, setSelectedStockRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Aggregated Stock Overview across all real database batch items
  const farmStockOverview = useMemo(() => {
    const feedItems = stockings.filter((s) => s.category?.toUpperCase() === 'FEED');
    const medicineItems = stockings.filter((s) => s.category?.toUpperCase() === 'MEDICINE');

    const aggregateCategory = (items, defaultUnit) => {
      if (!items || items.length === 0) return null;

      const totalQuantity = items.reduce((sum, item) => sum + (parseFloat(item.totalQuantity) || 0), 0);
      const totalAllocated = items.reduce((sum, item) => sum + (parseFloat(item.totalAllocated) || 0), 0);
      const totalUsed = items.reduce((sum, item) => sum + (parseFloat(item.totalUsed) || 0), 0);

      // Available for allocation = Total Quantity - Currently Allocated Quantity
      const unallocatedQuantity = Math.max(totalQuantity - totalAllocated, 0);
      const totalRemaining = Math.max(totalQuantity - totalUsed, 0);
      const unit = items[0]?.unit || defaultUnit;

      return {
        totalQuantity,
        totalAllocated,
        totalUsed,
        totalRemaining,
        unallocatedQuantity,
        unit,
      };
    };

    return {
      feed: aggregateCategory(feedItems, 'kg'),
      medicine: aggregateCategory(medicineItems, 'L'),
    };
  }, [stockings]);

  // Aggregate Site-Wise Stock Data
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
              const current = map[sId].feed || { allocated: 0, used: 0, remaining: 0, unit };
              map[sId].feed = {
                allocated: current.allocated + (parseFloat(ss.allocatedQuantity) || 0),
                used: current.used + (parseFloat(ss.usedQuantity) || 0),
                remaining: current.remaining + (parseFloat(ss.remainingQuantity) || 0),
                unit,
              };
            } else if (category === 'MEDICINE') {
              const current = map[sId].medicine || { allocated: 0, used: 0, remaining: 0, unit };
              map[sId].medicine = {
                allocated: current.allocated + (parseFloat(ss.allocatedQuantity) || 0),
                used: current.used + (parseFloat(ss.usedQuantity) || 0),
                remaining: current.remaining + (parseFloat(ss.remainingQuantity) || 0),
                unit,
              };
            }
          }
        });
      }
    });

    return Object.values(map);
  }, [sites, stockings]);

  const handleOpenAllocateForRecord = (record) => {
    setSelectedStockRecord(record);
    setIsAllocateOpen(true);
  };

  const handleOpenAllocateMain = () => {
    setSelectedStockRecord(null);
    setIsAllocateOpen(true);
  };

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
      await allocateStock({
        ...formData,
        stockingId: formData.stockingId || selectedStockRecord?.id
      });
      setIsAllocateOpen(false);
      setSelectedStockRecord(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAnyStock = stockings.length > 0;

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
              onClick={handleOpenAllocateMain}
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

      {/* ERROR DISPLAY BANNER */}
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
          {/* 2. REAL DATABASE INVENTORY SUMMARY TABLE */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div>
                <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                  <PackageCheck className="w-4.5 h-4.5 text-primary" /> Stock Inventory Summary
                </h3>
                <span className="text-xs text-text-secondary">Real database feed and medicine inventory entries</span>
              </div>
            </div>

            {hasAnyStock ? (
              <Card padding="normal" className="border-border/80 bg-surface shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/60 bg-background/50 text-[11px] font-bold uppercase text-text-secondary tracking-wider">
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Total Quantity</th>
                        <th className="py-3 px-4">Allocated</th>
                        <th className="py-3 px-4">Used</th>
                        <th className="py-3 px-4">Unallocated</th>
                        <th className="py-3 px-4">Unit</th>
                        <th className="py-3 px-4">Created Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium text-text-primary">
                      {stockings.map((item) => {
                        const isFeed = item.category?.toUpperCase() === 'FEED';
                        const unallocated = item.unallocatedQuantity ?? Math.max((parseFloat(item.totalQuantity) || 0) - (parseFloat(item.totalAllocated) || 0), 0);

                        return (
                          <tr key={item.id} className="hover:bg-background/40 transition-colors">
                            <td className="py-3 px-4 font-bold flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isFeed ? 'bg-teal-50 text-teal-600' : 'bg-cyan-50 text-cyan-600'}`}>
                                {isFeed ? <UtensilsCrossed className="w-3.5 h-3.5" /> : <Stethoscope className="w-3.5 h-3.5" />}
                              </div>
                              <Badge variant={isFeed ? 'success' : 'primary'} size="sm">
                                {item.category}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 font-extrabold text-sm text-text-primary">
                              {item.totalQuantity}
                            </td>
                            <td className="py-3 px-4 text-teal-700 font-bold">
                              {item.totalAllocated ?? 0}
                            </td>
                            <td className="py-3 px-4 text-amber-700 font-bold">
                              {item.totalUsed ?? 0}
                            </td>
                            <td className="py-3 px-4 text-emerald-700 font-bold">
                              {unallocated}
                            </td>
                            <td className="py-3 px-4 text-text-secondary uppercase font-semibold">
                              {item.unit || (isFeed ? 'kg' : 'L')}
                            </td>
                            <td className="py-3 px-4 text-text-secondary">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => handleOpenAllocateForRecord(item)}
                                icon={<ArrowUpRight className="w-3.5 h-3.5 text-primary" />}
                                disabled={sites.length === 0 || unallocated <= 0}
                              >
                                Allocate
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <Card padding="relaxed" className="border-border/80">
                <EmptyState
                  title="No Stock Available Yet"
                  description="No farm stock records found in database. Add Feed or Medicine stock to get started."
                  actionLabel="Add Stock"
                  onAction={() => setIsAddStockOpen(true)}
                />
              </Card>
            )}
          </div>

          {/* 3. FARM STOCK OVERVIEW SECTION */}
          <div className="space-y-4 pt-4 border-t border-border/80">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div>
                <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                  <Boxes className="w-4.5 h-4.5 text-primary" /> Farm Stock Aggregates
                </h3>
                <span className="text-xs text-text-secondary">Category breakdown & metrics</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* FEED STOCK CARD */}
              <Card padding="normal" className="border-border/80 bg-surface shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
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
                    <Badge variant={farmStockOverview.feed ? 'success' : 'neutral'} size="sm">
                      {farmStockOverview.feed ? 'In Stock' : 'No Stock'}
                    </Badge>
                  </div>

                  {farmStockOverview.feed ? (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-primary-light/30 border border-primary/20 flex items-center justify-between shadow-2xs">
                        <span className="text-xs uppercase font-bold text-primary tracking-wider">
                          Total Stock
                        </span>
                        <span className="text-xl font-black text-text-primary tracking-tight">
                          {farmStockOverview.feed.totalQuantity} <span className="text-xs font-semibold text-text-secondary">{farmStockOverview.feed.unit}</span>
                        </span>
                      </div>

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
                      No feed stock recorded in database.
                    </div>
                  )}
                </div>
              </Card>

              {/* MEDICINE STOCK CARD */}
              <Card padding="normal" className="border-border/80 bg-surface shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
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
                    <Badge variant={farmStockOverview.medicine ? 'primary' : 'neutral'} size="sm">
                      {farmStockOverview.medicine ? 'In Stock' : 'No Stock'}
                    </Badge>
                  </div>

                  {farmStockOverview.medicine ? (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-200/60 flex items-center justify-between shadow-2xs">
                        <span className="text-xs uppercase font-bold text-cyan-700 tracking-wider">
                          Total Stock
                        </span>
                        <span className="text-xl font-black text-text-primary tracking-tight">
                          {farmStockOverview.medicine.totalQuantity} <span className="text-xs font-semibold text-text-secondary">{farmStockOverview.medicine.unit}</span>
                        </span>
                      </div>

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
                      No medicine stock recorded in database.
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* 4. SITE-WISE STOCK SECTION */}
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
                            {feed ? (
                              <div className="p-3 rounded-xl bg-background border border-border/60 space-y-2">
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
                              </div>
                            ) : null}

                            {medicine ? (
                              <div className="p-3 rounded-xl bg-background border border-border/60 space-y-2">
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

      {/* 5. ADD STOCK MODAL */}
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

      {/* 6. ALLOCATE STOCK MODAL */}
      <Modal
        isOpen={isAllocateOpen}
        onClose={() => {
          setIsAllocateOpen(false);
          setSelectedStockRecord(null);
        }}
        title="Allocate Stock to Site"
        description={
          selectedStockRecord
            ? `Allocate ${selectedStockRecord.category} stock (${selectedStockRecord.unallocatedQuantity ?? Math.max((parseFloat(selectedStockRecord.totalQuantity) || 0) - (parseFloat(selectedStockRecord.totalAllocated) || 0), 0)} ${selectedStockRecord.unit} available) to a farm site.`
            : "Transfer farm stock inventory to a specific site."
        }
        size="md"
      >
        <AllocateStockForm
          onSubmit={handleAllocateSubmit}
          onCancel={() => {
            setIsAllocateOpen(false);
            setSelectedStockRecord(null);
          }}
          isSubmitting={isSubmitting}
          availableStockings={stockings}
          initialRecord={selectedStockRecord}
        />
      </Modal>
    </div>
  );
}
