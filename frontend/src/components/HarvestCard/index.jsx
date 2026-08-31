import React from 'react';
import { Wheat, Container, Calendar, Eye, Edit3, Trash2 } from 'lucide-react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

export const getHarvestLevelLabel = (harvestNumber, harvestType) => {
  if (harvestType === 'FINAL') return 'Final Harvest';
  const num = Number(harvestNumber) || 1;
  const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
  if (num <= ordinals.length) {
    return `${ordinals[num - 1]} Harvest`;
  }
  return `Harvest #${num}`;
};

/**
 * Reusable HarvestCard component displaying relevant harvest yield details, metrics, buyer info, and actions.
 * Metrics:
 * 1. Harvest Weight (kg)
 * 2. Shrimp Count
 * 3. Harvest Expense (₹)
 */
export const HarvestCard = ({
  harvest = {},
  onView,
  onViewDetails,
  onEdit,
  onDelete,
  className = '',
}) => {
  const handleView = onView || onViewDetails;

  const {
    tankName,
    harvestDate,
    production,
    harvestWeight,
    harvestType,
    harvestNumber,
    shrimpCount,
    buyerName,
    harvestExpense,
  } = harvest;

  const rawTank = tankName || harvest.crop?.tank?.tankName || harvest.crop?.tank?.name || 'A1';
  const cleanTank = rawTank.replace(/\s*\([^)]*\)/g, '').trim() || rawTank;
  const displayTank = cleanTank.toLowerCase().startsWith('tank') ? cleanTank : `Tank ${cleanTank}`;

  const displayBuyer = buyerName || 'Direct Market Buyer';
  const displayDate = harvestDate
    ? new Date(harvestDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Today';

  const weightVal = harvestWeight !== undefined && harvestWeight !== null
    ? parseFloat(harvestWeight)
    : parseFloat(production || 0);

  const countVal = shrimpCount ? shrimpCount : 'N/A';
  const numericExpense = parseFloat(harvestExpense || 0);

  const levelLabel = getHarvestLevelLabel(harvestNumber, harvestType);
  const isFinal = harvestType === 'FINAL';

  return (
    <Card
      hoverEffect={true}
      padding="normal"
      className={`flex flex-col justify-between border-border/80 bg-surface shadow-xs transition-all ${className}`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
            <Wheat className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-text-primary truncate tracking-tight flex items-center gap-1.5" title={displayTank}>
              <Container className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{displayTank}</span>
            </h3>
            <span className="text-[11px] text-text-secondary truncate block mt-0.5" title={`Buyer: ${displayBuyer}`}>
              Buyer: <span className="font-semibold text-text-primary">{displayBuyer}</span>
            </span>
          </div>
        </div>

        <Badge variant={isFinal ? 'warning' : 'primary'} size="sm" className="shrink-0 font-semibold">
          {levelLabel}
        </Badge>
      </div>

      {/* Metrics Grid Box (Harvest Weight kg, Shrimp Count, Expense) */}
      <div className="grid grid-cols-3 gap-2 py-3 border-b border-border/60 text-center">
        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Harvest Weight</span>
          <span className="text-xs sm:text-sm font-extrabold text-primary mt-0.5">
            {weightVal} <span className="text-[10px] font-normal text-text-secondary">kg</span>
          </span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Shrimp Count</span>
          <span className="text-xs sm:text-sm font-extrabold text-text-primary mt-0.5">
            {countVal}
          </span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Expense</span>
          <span className="text-xs sm:text-sm font-extrabold text-amber-700 mt-0.5">
            ₹{numericExpense.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Date Row */}
      <div className="py-2.5 text-xs text-text-secondary flex items-center justify-end">
        <span className="flex items-center gap-1 text-[11px] font-medium text-text-secondary">
          <Calendar className="w-3.5 h-3.5 text-text-secondary" /> {displayDate}
        </span>
      </div>

      {/* Actions Footer */}
      <div className="pt-3 flex items-center justify-between gap-2 mt-auto border-t border-border/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleView && handleView(harvest)}
          icon={<Eye className="w-4 h-4 text-primary" />}
          className="text-xs text-primary font-semibold hover:bg-primary-light/40"
        >
          View Details
        </Button>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(harvest)}
              className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-light/50 transition-colors"
              title="Edit Harvest Record"
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
