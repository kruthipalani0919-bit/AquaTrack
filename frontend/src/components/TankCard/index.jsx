import React from 'react';
import { Container, MapPin, Eye, Edit3, Trash2, Maximize2, Building2 } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';

/**
 * Reusable TankCard component displaying registered tank details:
 * Tank Name, Site Name, Area (Acres), Hatchery details, and Action Triggers.
 * Supports both `onView` and `onViewDetails` click handlers for robust connection.
 */
export const TankCard = ({
  tank = {},
  onView,
  onViewDetails,
  onEdit,
  onDelete,
  className = '',
}) => {
  const handleView = onViewDetails || onView;
  const { name, tankName, area, site, siteName, hatcheryName, hatcheryUnit } = tank;
  const displayName = name || tankName || 'Tank';
  const displaySite = site?.siteName || siteName || 'Site';
  const numericArea = parseFloat(area) || 0;

  return (
    <Card
      hoverEffect={true}
      padding="normal"
      className={`flex flex-col justify-between border-border/80 bg-surface shadow-xs transition-all ${className}`}
    >
      {/* Top Header Row: Icon, Tank Name, Site Name */}
      <div className="flex items-start gap-3 pb-3 border-b border-border/60">
        <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0 shadow-xs">
          <Container className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-base text-text-primary truncate tracking-tight" title={displayName}>
            {displayName}
          </h3>
          <span className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate font-medium">{displaySite}</span>
          </span>
        </div>
      </div>

      {/* Area Specification & Hatchery Details Box */}
      <div className="py-4 border-b border-border/60 space-y-2">
        <div className="flex flex-col items-start p-3 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-primary" /> Area
          </span>
          <span className="text-sm font-bold text-text-primary mt-1">
            {numericArea > 0 ? `${numericArea} Acres` : 'Not specified'}
          </span>
        </div>

        {(hatcheryName || hatcheryUnit) && (
          <div className="flex items-center gap-2 px-1 text-xs text-text-secondary truncate">
            <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate font-medium">
              {[hatcheryName, hatcheryUnit].filter(Boolean).join(' • ')}
            </span>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="pt-3 flex items-center justify-between gap-2 mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleView && handleView(tank)}
          icon={<Eye className="w-4 h-4 text-primary" />}
          className="text-xs font-medium"
        >
          Details
        </Button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit && onEdit(tank)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-light/50 transition-colors cursor-pointer"
            title="Edit Tank"
            aria-label={`Edit ${displayName}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete && onDelete(tank)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-light/50 transition-colors cursor-pointer"
            title="Delete Tank"
            aria-label={`Delete ${displayName}`}
          >
            <Trash2 className="w-4 h-4 text-danger/80" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default TankCard;
