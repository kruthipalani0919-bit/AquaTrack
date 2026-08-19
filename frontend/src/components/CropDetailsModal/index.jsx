import React from 'react';
import {
  Sprout,
  Container,
  Calendar,
  IndianRupee,
  Weight,
  Sparkles,
  TrendingUp,
  Edit3,
  Trash2,
  Tag,
  MapPin
} from 'lucide-react';

import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { CropTimeline } from '../CropTimeline';

/**
 * Reusable CropDetailsModal component displaying full specs, DOC progress,
 * financial projections, and visual culture timeline with 100% safe null-checks.
 */
export const CropDetailsModal = ({
  isOpen = false,
  onClose,
  crop = null,
  onEdit,
  onDelete,
}) => {
  if (!crop) return null;

  const {
    id,
    tankName,
    cropName,
    batchNumber,
    seedVariety,
    plCount,
    stockingDate,
    expectedHarvestDate,
    expectedProductionKg,
    expectedSellingPricePerKg,
    status,
    notes,
  } = crop;

  const displayName = cropName || (batchNumber ? `Batch ${batchNumber}` : seedVariety ? `Variety: ${seedVariety}` : 'Crop Batch');
  const displayTank = tankName || crop.tank?.tankName || 'Tank';
  const displayVariety = seedVariety || 'Standard';
  const displayBatch = batchNumber || cropName || 'N/A';

  // Safe Date & DOC calculation
  const now = new Date();
  const validStockingDate = stockingDate ? new Date(stockingDate) : null;
  const start = validStockingDate && !isNaN(validStockingDate.getTime()) ? validStockingDate : now;

  const validHarvestDate = expectedHarvestDate ? new Date(expectedHarvestDate) : null;
  const end = validHarvestDate && !isNaN(validHarvestDate.getTime())
    ? validHarvestDate
    : new Date(start.getTime() + 120 * 24 * 60 * 60 * 1000);

  const doc = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  const totalDurationDays = Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
  const progressPercent = Math.min(100, Math.max(0, Math.round((doc / totalDurationDays) * 100)));

  // Safe numerical calculations
  const numericPl = parseFloat(plCount) || 0;
  const numericProd = parseFloat(expectedProductionKg || crop.expectedProduction) || 0;
  const numericPrice = parseFloat(expectedSellingPricePerKg || crop.expectedSellingPrice) || 0;
  const totalRevenue = numericProd * numericPrice;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={displayName}
      description={`${displayVariety} Batch in ${displayTank}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Status Badge Row */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border">
          <span className="text-xs font-semibold text-text-secondary">Current Batch Status</span>
          <Badge
            variant={
              status === 'Active'
                ? 'success'
                : status === 'Harvested'
                ? 'primary'
                : status === 'Planned'
                ? 'warning'
                : 'danger'
            }
          >
            {status || 'Active'}
          </Badge>
        </div>

        {/* Culture Progress Section */}
        <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-text-primary flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" /> Days of Culture (DOC): {doc} Days
            </span>
            <span className="font-semibold text-primary">{progressPercent}% Progress</span>
          </div>

          <div className="w-full bg-background rounded-full h-2.5 overflow-hidden border border-border/40">
            <div
              className="bg-gradient-to-r from-primary via-teal-500 to-emerald-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1">
            <span>Stocked: {stockingDate ? new Date(stockingDate).toLocaleDateString() : 'N/A'}</span>
            <span>Target Harvest: {expectedHarvestDate ? new Date(expectedHarvestDate).toLocaleDateString() : 'Est. 120 Days'} ({totalDurationDays} Days Total)</span>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-surface border border-border">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
              <Tag className="w-3 h-3 text-primary" /> Batch Number
            </span>
            <span className="text-sm font-bold text-text-primary mt-0.5 block truncate" title={displayBatch}>
              {displayBatch}
            </span>
            <span className="text-[10px] text-text-secondary">Batch Identifier</span>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
              <Sprout className="w-3 h-3 text-primary" /> Seed Variety
            </span>
            <span className="text-sm font-bold text-text-primary mt-0.5 block truncate" title={displayVariety}>
              {displayVariety}
            </span>
            <span className="text-[10px] text-text-secondary">Species Strain</span>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
              <Container className="w-3 h-3 text-primary" /> Location Tank
            </span>
            <span className="text-sm font-bold text-text-primary mt-0.5 block truncate" title={displayTank}>
              {displayTank}
            </span>
            <span className="text-[10px] text-text-secondary">Pond / Tank</span>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
              <Calendar className="w-3 h-3 text-primary" /> Stocking Date
            </span>
            <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
              {stockingDate ? new Date(stockingDate).toLocaleDateString() : 'N/A'}
            </span>
            <span className="text-[10px] text-text-secondary">Initial Date</span>
          </div>
        </div>

        {/* Notes & Observations */}
        {notes && (
          <div className="p-3.5 rounded-xl bg-background border border-border">
            <span className="text-xs font-bold text-text-primary block mb-1">Batch Notes & Sampling Log</span>
            <p className="text-xs text-text-secondary leading-relaxed">{notes}</p>
          </div>
        )}

        {/* Culture Timeline Component */}
        <div className="p-4 rounded-xl bg-surface border border-border">
          <CropTimeline stockingDate={stockingDate} expectedHarvestDate={expectedHarvestDate} doc={doc} />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit && onEdit(crop)}
            icon={<Edit3 className="w-4 h-4" />}
          >
            Edit Crop
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete && onDelete(crop)}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CropDetailsModal;
