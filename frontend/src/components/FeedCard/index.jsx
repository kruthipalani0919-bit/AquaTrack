import React from 'react';
import { UtensilsCrossed, Container, Sprout, Calendar, Clock, Eye, Edit3, Trash2, Package } from 'lucide-react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * Reusable FeedCard component displaying feed log metrics, crop/tank badges,
 * feeding schedule parameters, and action buttons.
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
    cropName,
    tankName,
    feedBrand,
    feedType,
    quantityKg,
    feedingDate,
    feedingTime,
    feedCost,
    remainingStockKg,
    status,
  } = feedLog;

  const displayBrand = feedBrand || 'Feed Ration';
  const displayType = feedType || 'Pellet';
  const displayCrop = cropName || 'Crop';
  const displayTank = tankName || 'Tank';
  const numericCost = parseFloat(feedCost) || 0;
  const numericQty = parseFloat(quantityKg) || 0;
  const numericStock = parseFloat(remainingStockKg) || 0;

  const statusVariantMap = {
    Completed: 'success',
    Scheduled: 'warning',
    Missed: 'danger',
  };

  return (
    <Card
      hoverEffect={true}
      padding="normal"
      className={`flex flex-col justify-between border-border/80 bg-surface shadow-xs transition-all ${className}`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-text-primary truncate tracking-tight" title={displayBrand}>
              {displayBrand} <span className="font-normal text-text-secondary">({displayType})</span>
            </h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[11px] text-text-secondary flex items-center gap-1 font-medium">
                <Sprout className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate max-w-[120px]">{displayCrop}</span>
              </span>
              <span className="text-[11px] text-text-secondary flex items-center gap-1 font-medium">
                <Container className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{displayTank}</span>
              </span>
            </div>
          </div>
        </div>

        <Badge variant={statusVariantMap[status] || 'primary'} size="sm" className="shrink-0">
          {status || 'Completed'}
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 py-4 border-b border-border/60 text-center">
        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Ration</span>
          <span className="text-xs sm:text-sm font-bold text-text-primary mt-0.5">
            {numericQty} <span className="text-[10px] font-normal text-text-secondary">Kg</span>
          </span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Total Cost</span>
          <span className="text-xs sm:text-sm font-bold text-emerald-700 mt-0.5">
            ₹{numericCost.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider flex items-center gap-0.5">
            <Package className="w-3 h-3 text-primary" /> Stock
          </span>
          <span className="text-xs sm:text-sm font-bold text-text-primary mt-0.5">
            {numericStock} <span className="text-[10px] font-normal text-text-secondary">Kg</span>
          </span>
        </div>
      </div>

      {/* Schedule Info Row */}
      <div className="py-3 flex items-center justify-between text-xs text-text-secondary border-b border-border/40">
        <span className="flex items-center gap-1 font-medium">
          <Calendar className="w-3.5 h-3.5 text-primary" /> {feedingDate || 'Today'}
        </span>
        <span className="flex items-center gap-1 font-medium">
          <Clock className="w-3.5 h-3.5 text-accent" /> {feedingTime || 'Regular'}
        </span>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-3 flex items-center justify-between gap-2 mt-auto border-t border-border/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView && onView(feedLog)}
          icon={<Eye className="w-4 h-4 text-primary" />}
          className="text-xs text-primary font-medium"
        >
          View Log
        </Button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit && onEdit(feedLog)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-light/50 transition-colors"
            title="Edit Feed Record"
            aria-label="Edit feed record"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete && onDelete(feedLog)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-light/50 transition-colors"
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
