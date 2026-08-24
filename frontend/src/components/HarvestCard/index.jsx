import React from 'react';
import { Fish, Container, Calendar, Eye, Edit3, Trash2 } from 'lucide-react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * Reusable HarvestCard component displaying quick harvest summary:
 * 1. HEADER: Buyer Name, Tank Name, Harvested Badge
 * 2. MAIN SUMMARY: Shrimp Count, Avg Weight (ABW), Price per KG
 * 3. BOTTOM ROW: Harvest Date
 * 4. ACTIONS: View Details button, Edit icon, Delete icon
 */
export const HarvestCard = ({
  harvest = {},
  onView,
  onViewDetails,
  onEdit,
  onDelete,
  className = '',
}) => {
  const {
    tankName,
    harvestDate,
    shrimpCount,
    averageWeight,
    sellingPrice,
    buyerName,
  } = harvest;

  const handleView = onViewDetails || onView;

  const displayBuyer = buyerName || 'Direct Market Buyer';
  const rawTank = tankName || harvest?.tank?.name || harvest?.tank?.tankName || 'Tank';
  const displayTank = rawTank.replace(/\s*\([^)]*\)/g, '').trim() || rawTank;

  const formattedDate = harvestDate
    ? new Date(harvestDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Today';

  const numericCount = parseFloat(shrimpCount) || 0;
  const numericAbw = parseFloat(averageWeight) || 0;
  const numericPrice = parseFloat(sellingPrice) || 0;

  return (
    <Card
      hoverEffect={true}
      padding="normal"
      className={`flex flex-col justify-between border-border/80 bg-surface shadow-xs transition-all ${className}`}
    >
      {/* 1. HEADER */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
            <Fish className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-text-primary truncate tracking-tight" title={displayBuyer}>
              {displayBuyer}
            </h3>
            <span className="text-[11px] text-text-secondary flex items-center gap-1">
              <Container className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">{displayTank}</span>
            </span>
          </div>
        </div>

        <Badge variant="success" size="sm" className="shrink-0">
          Harvested
        </Badge>
      </div>

      {/* 2. MAIN SUMMARY (3 Columns: Shrimp Count, Avg Weight, Price) */}
      <div className="grid grid-cols-3 gap-2 py-3 border-b border-border/60 text-center">
        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">
            Shrimp Count
          </span>
          <span className="text-xs sm:text-sm font-bold text-text-primary mt-0.5">
            {numericCount > 0 ? numericCount.toLocaleString() : 'N/A'}
          </span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">
            Avg Weight
          </span>
          <span className="text-xs sm:text-sm font-bold text-text-primary mt-0.5">
            {numericAbw} g
          </span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">
            Price
          </span>
          <span className="text-xs sm:text-sm font-bold text-primary mt-0.5">
            ₹{numericPrice}/kg
          </span>
        </div>
      </div>

      {/* 3. BOTTOM ROW: Harvest Date */}
      <div className="py-2 text-xs text-text-secondary flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-text-secondary" /> {formattedDate}
        </span>
      </div>

      {/* 4. ACTIONS */}
      <div className="pt-3 flex items-center justify-between gap-2 mt-auto border-t border-border/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleView && handleView(harvest)}
          icon={<Eye className="w-4 h-4 text-primary" />}
          className="text-xs text-primary font-medium"
        >
          View Details
        </Button>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(harvest)}
              className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-light/50 transition-colors"
              title="Edit Harvest"
              aria-label={`Edit harvest for ${displayTank}`}
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(harvest)}
              className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-light/50 transition-colors"
              title="Delete Harvest Record"
              aria-label={`Delete harvest for ${displayTank}`}
            >
              <Trash2 className="w-4 h-4 text-danger/80" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default HarvestCard;
