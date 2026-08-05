import React from 'react';
import { Container, Waves, Eye, Edit3, Trash2, Maximize2, Layers } from 'lucide-react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * Reusable TankCard component displaying tank details, dimensions,
 * status badge, calculated volume, and action buttons.
 */
export const TankCard = ({
  tank,
  onView,
  onEdit,
  onDelete,
  className = '',
}) => {
  const { id, name, area, depth, waterSource, status, remarks } = tank;

  // Calculate volume in Million Liters (1 Acre = 4046.86 m², 1 m³ = 1000 Liters)
  const areaSqMeters = area * 4046.86;
  const volumeCubicMeters = areaSqMeters * depth;
  const volumeML = (volumeCubicMeters / 1000000).toFixed(2);

  const statusVariantMap = {
    Active: 'success',
    Preparation: 'warning',
    Maintenance: 'neutral',
  };

  const statusLabelMap = {
    Active: 'Active / Stocked',
    Preparation: 'In Preparation',
    Maintenance: 'Under Maintenance',
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
          <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0 shadow-xs">
            <Container className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-text-primary truncate tracking-tight" title={name}>
              {name}
            </h3>
            <span className="text-[11px] text-text-secondary flex items-center gap-1">
              <Waves className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">{waterSource} Water</span>
            </span>
          </div>
        </div>

        <Badge variant={statusVariantMap[status] || 'primary'} size="sm" className="shrink-0">
          {statusLabelMap[status] || status}
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 py-4 border-b border-border/60 text-center">
        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider flex items-center gap-1">
            <Maximize2 className="w-3 h-3 text-primary" /> Area
          </span>
          <span className="text-sm font-bold text-text-primary mt-0.5">
            {area} <span className="text-[11px] font-normal text-text-secondary">Acres</span>
          </span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-secondary" /> Depth
          </span>
          <span className="text-sm font-bold text-text-primary mt-0.5">
            {depth} <span className="text-[11px] font-normal text-text-secondary">m</span>
          </span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider flex items-center gap-1">
            <Waves className="w-3 h-3 text-accent" /> Est. Vol.
          </span>
          <span className="text-sm font-bold text-text-primary mt-0.5">
            {volumeML} <span className="text-[11px] font-normal text-text-secondary">ML</span>
          </span>
        </div>
      </div>

      {/* Remarks Snippet */}
      {remarks && (
        <div className="py-3 text-xs text-text-secondary line-clamp-2 leading-relaxed">
          <span className="font-semibold text-text-primary">Note: </span>
          {remarks}
        </div>
      )}

      {/* Card Actions Footer */}
      <div className="pt-3 flex items-center justify-between gap-2 mt-auto border-t border-border/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(tank)}
          icon={<Eye className="w-4 h-4 text-primary" />}
          className="text-xs text-primary font-medium"
        >
          Details
        </Button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(tank)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-light/50 transition-colors"
            title="Edit Tank"
            aria-label={`Edit ${name}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(tank)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-light/50 transition-colors"
            title="Delete Tank"
            aria-label={`Delete ${name}`}
          >
            <Trash2 className="w-4 h-4 text-danger/80" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default TankCard;
