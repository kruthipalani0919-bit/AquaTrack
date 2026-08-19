import React from 'react';
import { UtensilsCrossed, Container, Calendar, Eye, Edit3, Trash2 } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';

/**
 * Reusable FeedCard component displaying simplified feed log details:
 * Feed Brand, Feed Type, Tank, Feeding Date, Quantity, Cost / Kg, Total Cost, and Notes (if present).
 */
export const FeedCard = ({
  feedLog = {},
  onView,
  onEdit,
  onDelete,
  className = '',
}) => {
  const {
    id,
    tankName,
    feedBrand,
    feedType,
    quantity,
    quantityKg,
    costPerKg,
    pricePerKg,
    feedCost,
    date,
    feedingDate,
    notes,
  } = feedLog || {};

  const displayBrand = feedBrand || 'Not specified';
  const displayType = feedType || 'Feed';

  // Safely format tank name to NEVER display water source
  const rawTank = tankName || feedLog?.tank?.name || feedLog?.tank?.tankName || 'Tank';
  const displayTank = rawTank.replace(/\s*\([^)]*\)/g, '').trim() || rawTank;

  const numericQty = parseFloat(quantity ?? quantityKg) || 0;
  const numericCostPerKg = parseFloat(costPerKg ?? pricePerKg ?? (feedCost && numericQty ? feedCost / numericQty : 0)) || 0;
  const totalCost = feedCost ? parseFloat(feedCost) : numericQty * numericCostPerKg;

  const validDate = feedingDate || date;
  const formattedDate = validDate
    ? new Date(validDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Today';

  return (
    <Card
      hoverEffect={true}
      padding="normal"
      className={`flex flex-col justify-between border-border/80 bg-surface shadow-xs transition-all ${className}`}
    >
      {/* Header Row: Feed Brand & Feed Type */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-base text-text-primary truncate tracking-tight" title={displayBrand}>
              {displayBrand}
            </h3>
            <span className="text-xs text-text-secondary block font-medium mt-0.5 truncate">
              {displayType}
            </span>
          </div>
        </div>
      </div>

      {/* Tank & Feeding Date Details */}
      <div className="py-3 border-b border-border/60 space-y-1.5 text-xs text-text-secondary">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 font-medium">
            <Container className="w-3.5 h-3.5 text-primary" /> Tank:
          </span>
          <span className="font-semibold text-text-primary">{displayTank}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-primary" /> Feeding Date:
          </span>
          <span className="font-semibold text-text-primary">{formattedDate}</span>
        </div>
      </div>

      {/* Metrics Row: Quantity, Cost/Kg, Total Cost */}
      <div className="grid grid-cols-3 gap-2 py-3 border-b border-border/60 text-center">
        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40 min-w-0">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Quantity</span>
          <span className="text-xs font-bold text-text-primary mt-0.5">
            {numericQty} <span className="text-[10px] font-normal text-text-secondary">kg</span>
          </span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40 min-w-0">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Cost / Kg</span>
          <span className="text-xs font-bold text-text-primary mt-0.5">
            ₹{numericCostPerKg}
          </span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40 min-w-0">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Total Cost</span>
          <span className="text-xs font-bold text-emerald-700 mt-0.5">
            ₹{totalCost.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Notes (Only rendered if notes exist) */}
      {notes && (
        <div className="py-2.5 text-xs text-text-secondary line-clamp-2 leading-relaxed border-b border-border/40">
          <span className="font-semibold text-text-primary">Notes: </span>
          {notes}
        </div>
      )}

      {/* Actions Footer */}
      <div className="pt-3 flex items-center justify-between gap-2 mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView && onView(feedLog)}
          icon={<Eye className="w-4 h-4 text-primary" />}
          className="text-xs font-medium"
        >
          View Log
        </Button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit && onEdit(feedLog)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-light/50 transition-colors cursor-pointer"
            title="Edit Feed Record"
            aria-label="Edit feed record"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete && onDelete(feedLog)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-light/50 transition-colors cursor-pointer"
            title="Delete Feed Record"
            aria-label="Delete feed record"
          >
            <Trash2 className="w-4 h-4 text-danger/80" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default FeedCard;
