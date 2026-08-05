import React from 'react';
import { Sprout, Calendar, Eye, Edit3, Trash2, Container, IndianRupee, TrendingUp } from 'lucide-react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * Reusable CropCard component displaying crop culture metrics, DOC progress bar,
 * financial projections, and action triggers.
 */
export const CropCard = ({
  crop,
  onView,
  onEdit,
  onDelete,
  className = '',
}) => {
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
  } = crop;

  // 1. Calculate Days of Culture (DOC) & Duration
  const now = new Date();
  const start = new Date(stockingDate);
  const end = new Date(expectedHarvestDate);

  const diffTimeDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const doc = Math.max(0, diffTimeDays);

  const totalDurationDays = Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
  const progressPercent = Math.min(100, Math.max(0, Math.round((doc / totalDurationDays) * 100)));

  // 2. Financial calculation
  const estimatedRevenue = (parseFloat(expectedProductionKg) || 0) * (parseFloat(expectedSellingPricePerKg) || 0);

  // Status mapping
  const statusVariantMap = {
    Active: 'success',
    Harvested: 'primary',
    Planned: 'warning',
    Terminated: 'danger',
  };

  return (
    <Card
      hoverEffect={true}
      padding="normal"
      className={`flex flex-col justify-between border-border/80 bg-surface shadow-xs transition-all ${className}`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
            <Sprout className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-text-primary truncate tracking-tight" title={cropName}>
              {cropName}
            </h3>
            <span className="text-[11px] text-text-secondary flex items-center gap-1">
              <Container className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">{tankName}</span>
            </span>
          </div>
        </div>

        <Badge variant={statusVariantMap[status] || 'primary'} size="sm" className="shrink-0">
          {status}
        </Badge>
      </div>

      {/* Progress Bar (DOC) */}
      <div className="py-3 border-b border-border/60 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-text-primary flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-primary" /> DOC: {doc} Days
          </span>
          <span className="text-[11px] font-medium text-text-secondary">
            {progressPercent}% Complete ({totalDurationDays}d Target)
          </span>
        </div>
        <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border/40">
          <div
            className="bg-gradient-to-r from-primary to-teal-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 py-3 border-b border-border/60 text-center">
        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">PL Stocked</span>
          <span className="text-xs sm:text-sm font-bold text-text-primary mt-0.5">
            {(plCount / 1000).toFixed(0)}k <span className="text-[10px] font-normal text-text-secondary">PL</span>
          </span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Est. Yield</span>
          <span className="text-xs sm:text-sm font-bold text-text-primary mt-0.5">
            {expectedProductionKg} <span className="text-[10px] font-normal text-text-secondary">kg</span>
          </span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Est. Revenue</span>
          <span className="text-xs sm:text-sm font-bold text-emerald-700 mt-0.5 flex items-center justify-center">
            ₹{(estimatedRevenue / 100000).toFixed(2)}L
          </span>
        </div>
      </div>

      {/* Species & Variety details */}
      <div className="py-2.5 text-xs text-text-secondary flex items-center justify-between">
        <span className="truncate max-w-[180px]">
          <span className="font-semibold text-text-primary">Variety: </span>
          {seedVariety}
        </span>
        <span className="font-semibold text-primary flex items-center gap-0.5 shrink-0">
          <TrendingUp className="w-3.5 h-3.5" /> ₹{expectedSellingPricePerKg}/kg
        </span>
      </div>

      {/* Actions Footer */}
      <div className="pt-3 flex items-center justify-between gap-2 mt-auto border-t border-border/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(crop)}
          icon={<Eye className="w-4 h-4 text-primary" />}
          className="text-xs text-primary font-medium"
        >
          View Progress
        </Button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(crop)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-light/50 transition-colors"
            title="Edit Crop"
            aria-label={`Edit ${cropName}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(crop)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-light/50 transition-colors"
            title="Delete Crop"
            aria-label={`Delete ${cropName}`}
          >
            <Trash2 className="w-4 h-4 text-danger/80" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default CropCard;
