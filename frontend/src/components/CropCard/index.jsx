import React from 'react';
import { Sprout, Calendar, Eye, Edit3, Trash2, Container } from 'lucide-react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * Simplified CropCard component displaying:
 * - Batch Number / Crop identifier
 * - Status Badge
 * - Tank name
 * - Seed Variety
 * - Stocking Date
 * - Simple DOC progress bar
 * - View Progress, Edit, Delete triggers
 */
export const CropCard = ({
  crop = {},
  onView,
  onEdit,
  onDelete,
  className = '',
}) => {
  const {
    id,
    tankName,
    cropName,
    batchNumber,
    seedVariety,
    stockingDate,
    expectedHarvestDate,
    status,
  } = crop || {};

  const displayName = batchNumber ? `Batch ${batchNumber}` : cropName || 'Crop Batch';
  const displayTank = tankName || crop?.tank?.tankName || 'Tank';
  const displayVariety = seedVariety || 'Not specified';

  // Safe Date & DOC calculation
  const now = new Date();
  const validStockingDate = stockingDate ? new Date(stockingDate) : null;
  const start = validStockingDate && !isNaN(validStockingDate.getTime()) ? validStockingDate : now;

  const validHarvestDate = expectedHarvestDate ? new Date(expectedHarvestDate) : null;
  const end = validHarvestDate && !isNaN(validHarvestDate.getTime())
    ? validHarvestDate
    : new Date(start.getTime() + 120 * 24 * 60 * 60 * 1000);

  const diffTimeDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const doc = Math.max(0, diffTimeDays);

  const totalDurationDays = Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
  const progressPercent = Math.min(100, Math.max(0, Math.round((doc / totalDurationDays) * 100)));

  const formattedStockingDate = validStockingDate && !isNaN(validStockingDate.getTime())
    ? validStockingDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not specified';

  return (
    <Card
      hoverEffect={true}
      padding="normal"
      className={`flex flex-col justify-between border-border/80 bg-surface shadow-xs transition-all ${className}`}
    >
      {/* Header Row: Batch Name, Status Badge */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
            <Sprout className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-base text-text-primary truncate tracking-tight" title={displayName}>
              {displayName}
            </h3>
            <span className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
              <Container className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate font-medium">{displayTank}</span>
            </span>
          </div>
        </div>

        <Badge variant={status === 'Active' ? 'success' : 'primary'} size="sm" className="shrink-0">
          {status || 'Active'}
        </Badge>
      </div>

      {/* Details: Seed Variety & Stocking Date */}
      <div className="py-3 border-b border-border/60 space-y-1.5 text-xs text-text-secondary">
        <div className="flex items-center justify-between">
          <span>Seed Variety:</span>
          <span className="font-semibold text-text-primary">{displayVariety}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Stocking Date:</span>
          <span className="font-semibold text-text-primary">{formattedStockingDate}</span>
        </div>
      </div>

      {/* Simple Progress Indicator (DOC & Progress Bar) */}
      <div className="py-3 border-b border-border/60 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-text-primary flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-primary" /> DOC: {doc} Days
          </span>
          <span className="text-[11px] font-medium text-text-secondary">
            {progressPercent}% Complete
          </span>
        </div>
        <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border/40">
          <div
            className="bg-gradient-to-r from-primary to-teal-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Actions Footer */}
      <div className="pt-3 flex items-center justify-between gap-2 mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView && onView(crop)}
          icon={<Eye className="w-4 h-4 text-primary" />}
          className="text-xs text-primary font-medium"
        >
          View Progress
        </Button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit && onEdit(crop)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-light/50 transition-colors cursor-pointer"
            title="Edit Crop"
            aria-label={`Edit ${displayName}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete && onDelete(crop)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-light/50 transition-colors cursor-pointer"
            title="Delete Crop"
            aria-label={`Delete ${displayName}`}
          >
            <Trash2 className="w-4 h-4 text-danger/80" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default CropCard;
