import React from 'react';
import { Sprout, Eye, Edit3, Trash2, Container } from 'lucide-react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * Simplified CropCard component displaying ONLY user-registered crop details:
 * - Batch Number / Crop Identifier
 * - Status Badge
 * - Tank Name
 * - Seed Variety
 * - Stocking Date
 * - Action buttons (View Details, Edit, Delete)
 * All progress bars, DOC calculations, and culture milestone bars are completely removed.
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

  // Format tank name cleanly to NEVER display water source
  const rawTank = tankName || crop?.tank?.name || crop?.tank?.tankName || 'Tank';
  const displayTank = rawTank.replace(/\s*\([^)]*\)/g, '').trim() || rawTank;

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
            <span className="text-xs text-text-secondary flex items-center gap-1 mt-0.5 font-medium">
              <Container className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">Tank: {displayTank}</span>
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

      {/* Actions Footer */}
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
