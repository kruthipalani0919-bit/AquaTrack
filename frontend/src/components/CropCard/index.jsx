import React from 'react';
import { Sprout, Eye, Edit3, Trash2 } from 'lucide-react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * Reusable CropCard component matching the exact visual language, structure,
 * padding, icon container, typography, and button styling of TankCard:
 * - Header: Sprout icon in pastel container, Batch Title (e.g. Batch 53), Tank Subtitle (e.g. A1 or No Tank Assigned) directly below, Status Badge (Active) top right.
 * - Information Area: Single specification box displaying Seed Variety & Stocking Date.
 * - Footer Actions: View Details (primary outline button), Edit & Delete icon triggers.
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
    status,
  } = crop || {};

  const displayName = batchNumber ? `Batch ${batchNumber}` : cropName || 'Crop Batch';
  const displayVariety = seedVariety || 'Not specified';

  // Format tank name cleanly: e.g. "A1" or "No Tank Assigned" without fallback to generic "Tank" or "A1"
  const rawTank = tankName || crop?.tank?.tankName || crop?.tank?.name || (crop?.tankId ? 'Tank' : 'No Tank Assigned');
  const cleanTank = rawTank.replace(/\s*\([^)]*\)/g, '').trim() || rawTank;
  const tankLabel = cleanTank;

  const validStockingDate = stockingDate ? new Date(stockingDate) : null;
  const formattedStockingDate = validStockingDate && !isNaN(validStockingDate.getTime())
    ? validStockingDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not specified';

  return (
    <Card
      hoverEffect={true}
      padding="normal"
      className={`flex flex-col justify-between border-border/80 bg-surface shadow-xs transition-all ${className}`}
    >
      {/* 1. TOP HEADER ROW: Icon, Batch Title, Tank Subtitle & Status Badge */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-xs">
            <Sprout className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-base text-text-primary truncate tracking-tight" title={displayName}>
              {displayName}
            </h3>
            <span className="text-xs text-text-secondary block truncate mt-0.5 font-medium" title={tankLabel}>
              {tankLabel}
            </span>
          </div>
        </div>

        <Badge variant={status === 'Active' ? 'success' : 'primary'} size="sm" className="shrink-0 font-medium">
          {status || 'Active'}
        </Badge>
      </div>

      {/* 2. INFORMATION SPECIFICATION BOX */}
      <div className="py-4 border-b border-border/60">
        <div className="flex flex-col items-start p-3 rounded-lg bg-background/60 border border-border/40 space-y-2">
          <div className="w-full flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">
              Seed Variety
            </span>
            <span className="text-xs font-bold text-text-primary truncate ml-2">
              {displayVariety}
            </span>
          </div>

          <div className="w-full flex items-center justify-between pt-1.5 border-t border-border/40">
            <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">
              Stocking Date
            </span>
            <span className="text-xs font-bold text-text-primary truncate ml-2">
              {formattedStockingDate}
            </span>
          </div>
        </div>
      </div>

      {/* 3. CARD ACTIONS FOOTER */}
      <div className="pt-3 flex items-center justify-between gap-2 mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView && onView(crop)}
          icon={<Eye className="w-4 h-4 text-primary" />}
          className="text-xs font-medium"
        >
          View Details
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
