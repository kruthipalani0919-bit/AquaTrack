import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
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
import { PasswordConfirmationModal } from '../../components/PasswordConfirmationModal';
import { AddStockForm } from '../../components/AddStockModal';

import { useStocking } from '../../context/StockingContext';
import { useSites } from '../../context/SiteContext';
import { useTanks } from '../../context/TankContext';
import { useFeed } from '../../context/FeedContext';
import { useMedicine } from '../../context/MedicineContext';
import { subscribeToSyncBus } from '../../utils/syncBus';

export default function Stocking() {
  const {
    stockings = [],
    loading,
    error,
    fetchStockings,
    addStock,
    updateStock,
    deleteStock
  } = useStocking();
  const { sites = [], loading: sitesLoading } = useSites();
  const { tanks = [] } = useTanks();
  const { feedLogs = [] } = useFeed();
  const { medicineRecords = [] } = useMedicine();

  // Refetch stock inventory on mount / navigation and on real-time syncBus events
  useEffect(() => {
    if (typeof fetchStockings === 'function') {
      fetchStockings();
    }

    const unsubscribe = subscribeToSyncBus((detail) => {
      if (['SITE', 'TANK', 'CROP', 'STOCKING', 'FEED', 'MEDICINE'].includes(detail.entityType)) {
        if (typeof fetchStockings === 'function') {
          fetchStockings(true);
        }
      }
    });

    return unsubscribe;
  }, [fetchStockings]);

  // Modal & Action states
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit/Delete Stock States
  const [editingStock, setEditingStock] = useState(null);
  const [editingStockQuantity, setEditingStockQuantity] = useState('');
  const [deletingStockId, setDeletingStockId] = useState(null);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  // Map Tank ID to Site ID for fast live usage resolution
  const tankSiteMap = useMemo(() => {
    const map = {};
    tanks.forEach((t) => {
      const tId = String(t.id);
      const sId = String(t.siteId || t.site?.id || '');
      if (tId && sId) {
        map[tId] = sId;
      }
    });
    return map;
  }, [tanks]);

  // Group Stock Inventory by Site and Category (FEED & MEDICINE) with Instant Dynamic Sync
  const siteWiseStockList = useMemo(() => {
    return sites.map((site) => {
      const siteIdStr = String(site.id);

      // Live Feed usage sum directly from FeedContext for 0ms instant frontend reflection
      const liveFeedUsed = feedLogs.reduce((sum, f) => {
        const logTankId = String(f.tankId || f.crop?.tankId || f.crop?.tank?.id || '');
        const logSiteId = tankSiteMap[logTankId] || String(f.siteId || f.crop?.tank?.siteId || '');
        if (logSiteId === siteIdStr) {
          return sum + (parseFloat(f.quantityKg ?? f.quantity) || 0);
        }
        return sum;
      }, 0);

      // Live Medicine usage sum directly from MedicineContext for 0ms instant frontend reflection
      const liveMedicineUsed = medicineRecords.reduce((sum, m) => {
        const recTankId = String(m.tankId || m.tank?.id || '');
        const recSiteId = tankSiteMap[recTankId] || String(m.siteId || m.tank?.siteId || '');
        if (recSiteId === siteIdStr) {
          return sum + (parseFloat(m.quantity) || 0);
        }
        return sum;
      }, 0);

      // Feed Stock Metrics for this Site
      let feedAdded = 0;
      let backendFeedUsed = 0;
      let feedUnit = 'kg';
      let feedStockId = null;

      // Medicine Stock Metrics for this Site
      let medicineAdded = 0;
      let backendMedicineUsed = 0;
      let medicineUnit = 'L';
      let medicineStockId = null;

      stockings.forEach((s) => {
        const cat = s.category?.toUpperCase();
        const matchesSite = (s.siteId && String(s.siteId) === siteIdStr) || (s.site?.id && String(s.site.id) === siteIdStr);

        if (matchesSite) {
          if (cat === 'FEED') {
            feedAdded += parseFloat(s.totalQuantity) || 0;
            backendFeedUsed = Math.max(backendFeedUsed, parseFloat(s.totalUsed) || 0);
            feedUnit = s.unit || 'kg';
            feedStockId = s.id;
          } else if (cat === 'MEDICINE') {
            medicineAdded += parseFloat(s.totalQuantity) || 0;
            backendMedicineUsed = Math.max(backendMedicineUsed, parseFloat(s.totalUsed) || 0);
            medicineUnit = s.unit || 'L';
            medicineStockId = s.id;
          }
        } else if (Array.isArray(s.siteStock)) {
          const match = s.siteStock.find((ss) => String(ss.site?.id || ss.siteId) === siteIdStr);
          if (match) {
            if (cat === 'FEED') {
              feedAdded += parseFloat(match.allocatedQuantity) || 0;
              backendFeedUsed = Math.max(backendFeedUsed, parseFloat(match.usedQuantity) || 0);
              feedUnit = match.unit || s.unit || 'kg';
              if (!feedStockId) feedStockId = s.id;
            } else if (cat === 'MEDICINE') {
              medicineAdded += parseFloat(match.allocatedQuantity) || 0;
              backendMedicineUsed = Math.max(backendMedicineUsed, parseFloat(match.usedQuantity) || 0);
              medicineUnit = match.unit || s.unit || 'L';
              if (!medicineStockId) medicineStockId = s.id;
            }
          }
        }
      });

      const feedUsed = Math.max(liveFeedUsed, backendFeedUsed);
      const medicineUsed = Math.max(liveMedicineUsed, backendMedicineUsed);

      const feedRemaining = Math.max(feedAdded - feedUsed, 0);
      const medicineRemaining = Math.max(medicineAdded - medicineUsed, 0);

      return {
        site,
        feed: feedAdded > 0 || feedUsed > 0 ? {
          id: feedStockId,
          added: feedAdded,
          used: feedUsed,
          remaining: feedRemaining,
          unit: feedUnit,
        } : null,
        medicine: medicineAdded > 0 || medicineUsed > 0 ? {
          id: medicineStockId,
          added: medicineAdded,
          used: medicineUsed,
          remaining: medicineRemaining,
          unit: medicineUnit,
        } : null,
      };
    });
  }, [sites, stockings, tanks, tankSiteMap, feedLogs, medicineRecords]);

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

  // Edit & Delete Stock Handlers
  const handleOpenEditStock = (stockItem) => {
    setEditingStock(stockItem);
    setEditingStockQuantity(String(stockItem.added || stockItem.totalQuantity || ''));
  };

  const handleUpdateStockSubmit = async (e) => {
    e.preventDefault();
    if (!editingStock || !editingStock.id) return;
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

  const handleAcceptDeleteStep1 = () => {
    setIsPasswordOpen(true);
  };

  const handleFinalDeleteWithPassword = async (password) => {
    if (deletingStockId) {
      await deleteStock(deletingStockId, password);
      setIsPasswordOpen(false);
      setDeletingStockId(null);
    }
  };

  const hasAnyStock = stockings.length > 0;

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Stocking Management"
        subtitle="Manage site-level stock inventory directly for feed and medicine."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddStockOpen(true)}
            icon={<Plus className="w-4 h-4" />}
            className="font-semibold shadow-xs"
            disabled={sites.length === 0}
          >
            Add Stock
          </Button>
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
      {(loading || sitesLoading) && !hasAnyStock ? (
        <div className="py-12 flex justify-center items-center">
          <Loader size="lg" text="Loading stocking inventory..." />
        </div>
      ) : sites.length === 0 ? (
        <Card padding="relaxed" className="border-border/80">
          <EmptyState
            title="No Sites Available"
            description="You need to create at least one Site before adding site-level stock."
          />
        </Card>
      ) : (
        /* 2. SITE-WISE STOCK DASHBOARD CARDS */
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div>
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <Boxes className="w-4.5 h-4.5 text-primary" /> Site-wise Stock Inventory
              </h3>
              <span className="text-xs text-text-secondary">Site-level Feed & Medicine inventory tracking</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {siteWiseStockList.map(({ site, feed, medicine }) => {
              const hasSiteStock = Boolean(feed || medicine);

              return (
                <Card key={site.id} padding="normal" className="border-border/80 bg-surface shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Site Header */}
                    <div className="flex items-start justify-between pb-3 border-b border-border/60">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0 shadow-xs">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-text-primary">{site.siteName}</h4>
                          <span className="text-xs text-text-secondary">{site.location || 'Site Location'}</span>
                        </div>
                      </div>
                      <Badge variant={hasSiteStock ? 'success' : 'neutral'} size="sm">
                        {hasSiteStock ? 'In Stock' : 'No Stock'}
                      </Badge>
                    </div>

                    {hasSiteStock ? (
                      <div className="space-y-3">
                        {/* FEED STOCK BOX */}
                        {feed ? (
                          <div className="p-3.5 rounded-xl bg-teal-50/40 border border-teal-200/60 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-teal-900 flex items-center gap-1.5 uppercase tracking-wider">
                                <UtensilsCrossed className="w-3.5 h-3.5 text-teal-600" /> Feed Stock
                              </span>
                              {feed.id && (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditStock({ ...feed, category: 'FEED' })}
                                    title="Edit Feed Stock"
                                    className="p-1 text-text-secondary hover:text-primary rounded hover:bg-primary-light transition-colors cursor-pointer"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingStockId(feed.id)}
                                    title="Delete Feed Stock"
                                    className="p-1 text-text-secondary hover:text-danger rounded hover:bg-danger-light transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              <div className="p-2 rounded-lg bg-white/90 border border-teal-100">
                                <span className="text-[10px] uppercase font-bold text-text-secondary block">Added</span>
                                <span className="text-sm font-extrabold text-text-primary mt-0.5 block">
                                  {feed.added} <span className="text-[10px] font-medium text-text-secondary">{feed.unit}</span>
                                </span>
                              </div>

                              <div className="p-2 rounded-lg bg-white/90 border border-teal-100">
                                <span className="text-[10px] uppercase font-bold text-text-secondary block">Used</span>
                                <span className="text-sm font-extrabold text-amber-700 mt-0.5 block">
                                  {feed.used} <span className="text-[10px] font-medium text-text-secondary">{feed.unit}</span>
                                </span>
                              </div>

                              <div className="p-2 rounded-lg bg-white/90 border border-teal-100">
                                <span className="text-[10px] uppercase font-bold text-text-secondary block">Remaining</span>
                                <span className="text-sm font-extrabold text-emerald-700 mt-0.5 block">
                                  {feed.remaining} <span className="text-[10px] font-medium text-text-secondary">{feed.unit}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {/* MEDICINE STOCK BOX */}
                        {medicine ? (
                          <div className="p-3.5 rounded-xl bg-cyan-50/40 border border-cyan-200/60 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-cyan-900 flex items-center gap-1.5 uppercase tracking-wider">
                                <Stethoscope className="w-3.5 h-3.5 text-cyan-600" /> Medicine Stock
                              </span>
                              {medicine.id && (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditStock({ ...medicine, category: 'MEDICINE' })}
                                    title="Edit Medicine Stock"
                                    className="p-1 text-text-secondary hover:text-primary rounded hover:bg-primary-light transition-colors cursor-pointer"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingStockId(medicine.id)}
                                    title="Delete Medicine Stock"
                                    className="p-1 text-text-secondary hover:text-danger rounded hover:bg-danger-light transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              <div className="p-2 rounded-lg bg-white/90 border border-cyan-100">
                                <span className="text-[10px] uppercase font-bold text-text-secondary block">Added</span>
                                <span className="text-sm font-extrabold text-text-primary mt-0.5 block">
                                  {medicine.added} <span className="text-[10px] font-medium text-text-secondary">{medicine.unit}</span>
                                </span>
                              </div>

                              <div className="p-2 rounded-lg bg-white/90 border border-cyan-100">
                                <span className="text-[10px] uppercase font-bold text-text-secondary block">Used</span>
                                <span className="text-sm font-extrabold text-amber-700 mt-0.5 block">
                                  {medicine.used} <span className="text-[10px] font-medium text-text-secondary">{medicine.unit}</span>
                                </span>
                              </div>

                              <div className="p-2 rounded-lg bg-white/90 border border-cyan-100">
                                <span className="text-[10px] uppercase font-bold text-text-secondary block">Remaining</span>
                                <span className="text-sm font-extrabold text-emerald-700 mt-0.5 block">
                                  {medicine.remaining} <span className="text-[10px] font-medium text-text-secondary">{medicine.unit}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-text-secondary bg-background/50 rounded-xl border border-dashed border-border/60">
                        No feed or medicine stock added to this site yet.
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ADD STOCK MODAL */}
      <Modal
        isOpen={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
        title="Add Site Stock"
        description="Add feed or medicine inventory directly to a specific site."
        size="md"
      >
        <AddStockForm
          onSubmit={handleAddStockSubmit}
          onCancel={() => setIsAddStockOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* 4. EDIT STOCK MODAL */}
      <Modal
        isOpen={Boolean(editingStock)}
        onClose={() => setEditingStock(null)}
        title={`Edit ${editingStock?.category === 'FEED' ? 'Feed' : 'Medicine'} Stock`}
        description="Update total site stock inventory quantity."
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

      {/* 5. DELETE STOCK CONFIRMATION DIALOG (Step 1) */}
      <ConfirmationDialog
        isOpen={Boolean(deletingStockId) && !isPasswordOpen}
        onClose={() => setDeletingStockId(null)}
        onConfirm={handleAcceptDeleteStep1}
        title="Delete Stock Record"
        message="Are you sure you want to delete this stock record from the site?"
        confirmText="Delete Stock"
        type="danger"
      />

      {/* 6. PASSWORD CONFIRMATION MODAL (Step 2) */}
      <PasswordConfirmationModal
        isOpen={isPasswordOpen}
        onClose={() => {
          setIsPasswordOpen(false);
          setDeletingStockId(null);
        }}
        onConfirm={handleFinalDeleteWithPassword}
      />
    </div>
  );
}
