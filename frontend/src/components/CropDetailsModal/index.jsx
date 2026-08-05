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
  Trash2
} from 'lucide-react';

import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { CropTimeline } from '../CropTimeline';

/**
 * Reusable CropDetailsModal component displaying full specs, DOC progress,
 * financial projections, and visual culture timeline.
 */
export const CropDetailsModal = ({
  isOpen = false,
  onClose,
  crop,
  onEdit,
  onDelete,
}) => {
  if (!crop) return null;

  const {
    id,
    tankName,
    cropName,
    seedVariety,
    plCount,
    stockingDate,
    expectedHarvestDate,
    expectedProductionKg,
    expectedSellingPricePerKg,
    status,
    notes,
  } = crop;

  // Calculate DOC & Duration
  const now = new Date();
  const start = new Date(stockingDate);
  const end = new Date(expectedHarvestDate);

  const doc = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  const totalDurationDays = Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
  const progressPercent = Math.min(100, Math.max(0, Math.round((doc / totalDurationDays) * 100)));

  // Financial calculation
  const totalRevenue = (parseFloat(expectedProductionKg) || 0) * (parseFloat(expectedSellingPricePerKg) || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={cropName}
      description={`Culture Batch in ${tankName}`}
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
            {status}
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
            <span>Stocked: {stockingDate}</span>
            <span>Target Harvest: {expectedHarvestDate} ({totalDurationDays} Days Total)</span>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-surface border border-border">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block">PL Stocked</span>
            <span className="text-sm font-bold text-text-primary mt-0.5 block">
              {(plCount / 1000).toFixed(0)}k PL
            </span>
            <span className="text-[10px] text-text-secondary">({plCount.toLocaleString()} units)</span>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Target Yield</span>
            <span className="text-sm font-bold text-text-primary mt-0.5 block">
              {expectedProductionKg} kg
            </span>
            <span className="text-[10px] text-text-secondary">({(expectedProductionKg / 1000).toFixed(2)} Tons)</span>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Target Price</span>
            <span className="text-sm font-bold text-text-primary mt-0.5 block">
              ₹{expectedSellingPricePerKg}/kg
            </span>
            <span className="text-[10px] text-text-secondary">Est. Market Rate</span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200">
            <span className="text-[10px] text-emerald-800 uppercase font-semibold block">Est. Revenue</span>
            <span className="text-sm font-bold text-emerald-800 mt-0.5 block">
              ₹{(totalRevenue / 100000).toFixed(2)} Lakhs
            </span>
            <span className="text-[10px] text-emerald-700">₹{totalRevenue.toLocaleString()}</span>
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
            onClick={() => onEdit(crop)}
            icon={<Edit3 className="w-4 h-4" />}
          >
            Edit Crop
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(crop)}
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
