import React from 'react';
import { Wheat, Container, Calendar, Eye, Edit3, Trash2, TrendingUp } from 'lucide-react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * Reusable HarvestCard component displaying harvest yield details, metrics, buyer info, and actions.
 */
export const HarvestCard = ({
  harvest = {},
  onView,
  onEdit,
  onDelete,
  className = '',
}) => {
  const {
    id,
    tankName,
    harvestDate,
    production,
    averageWeight,
    survivalRate,
    sellingPrice,
    buyerName,
    transportationCost,
    harvestExpense,
  } = harvest;

  const displayBuyer = buyerName || 'Direct Market Buyer';
  const displayTank = tankName || 'Tank';
  const displayDate = harvestDate || 'Today';
  const numericProd = parseFloat(production) || 0;
  const numericAbw = parseFloat(averageWeight) || 0;
  const numericSurvival = parseFloat(survivalRate) || 0;
  const numericPrice = parseFloat(sellingPrice) || 0;

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

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 py-3 border-b border-border/60 text-center">
        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Production</span>
          <span className="text-xs sm:text-sm font-bold text-text-primary mt-0.5">
            {numericProd} <span className="text-[10px] font-normal text-text-secondary">kg</span>
          </span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Avg Weight</span>
          <span className="text-xs sm:text-sm font-bold text-text-primary mt-0.5">
            {numericAbw} <span className="text-[10px] font-normal text-text-secondary">g</span>
          </span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Survival</span>
          <span className="text-xs sm:text-sm font-bold text-emerald-700 mt-0.5">
            {numericSurvival}%
          </span>
        </div>
      </div>

      {/* Selling Price & Date Row */}
      <div className="py-2.5 text-xs text-text-secondary flex items-center justify-between">
        <span className="font-semibold text-primary flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" /> ₹{numericPrice}/kg
        </span>
        <span className="flex items-center gap-1 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-text-secondary" /> {displayDate}
        </span>
      </div>

      {/* Actions Footer */}
      <div className="pt-3 flex items-center justify-between gap-2 mt-auto border-t border-border/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView && onView(harvest)}
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

          <button
            type="button"
            onClick={() => onDelete && onDelete(harvest)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-light/50 transition-colors"
            title="Delete Harvest Record"
            aria-label={`Delete harvest for ${displayTank}`}
          >
            <Trash2 className="w-4 h-4 text-danger/80" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default HarvestCard;
