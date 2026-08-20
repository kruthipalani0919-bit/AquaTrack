import React from 'react';
import { MapPin, Container, Edit3, Trash2, Layers } from 'lucide-react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * Reusable SiteCard component matching the exact visual language, structure,
 * padding, icon container, typography, and button styling of TankCard:
 * - Header: Location icon in pastel container, Site Title (e.g. SAI AQUA), Location Subtitle (e.g. Bvrm) directly below, Tank Count Badge (e.g. 1 Tank)
 * - Information Area: Land Area Specification Box
 * - Footer Actions: View Tanks (primary outline button), Edit & Delete icon triggers
 */
export const SiteCard = ({
  site = {},
  onViewTanks,
  onEdit,
  onDelete,
  className = '',
}) => {
  const {
    id,
    siteName,
    location,
    landArea,
    area,
    totalArea,
    tanks,
    _count,
  } = site;

  const tankCount = Array.isArray(tanks) ? tanks.length : (_count?.tanks || 0);

  const numArea = parseFloat(landArea ?? area ?? totalArea);
  const hasArea = !isNaN(numArea) && numArea > 0;

  return (
    <Card
      hoverEffect={true}
      padding="normal"
      className={`flex flex-col justify-between border-border/80 bg-surface shadow-xs transition-all ${className}`}
    >
      {/* 1. TOP HEADER ROW: Icon, Site Name, Location Subtitle & Tank Badge */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0 shadow-xs">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-base text-text-primary truncate tracking-tight" title={siteName}>
              {siteName}
            </h3>
            {location && (
              <span className="text-xs text-text-secondary block truncate mt-0.5 font-medium" title={location}>
                {location}
              </span>
            )}
          </div>
        </div>

        <Badge variant="primary" size="sm" className="shrink-0 flex items-center gap-1 font-medium">
          <Container className="w-3.5 h-3.5" />
          {tankCount} {tankCount === 1 ? 'Tank' : 'Tanks'}
        </Badge>
      </div>

      {/* 2. LAND AREA SPECIFICATION BOX */}
      <div className="py-4 border-b border-border/60">
        <div className="flex flex-col items-start p-3 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" /> Land Area
          </span>
          <span className="text-sm font-bold text-text-primary mt-1">
            {hasArea ? `${numArea} Acres` : 'Not specified'}
          </span>
        </div>
      </div>

      {/* 3. CARD ACTIONS FOOTER */}
      <div className="pt-3 flex items-center justify-between gap-2 mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewTanks && onViewTanks(site)}
          icon={<Container className="w-4 h-4 text-primary" />}
          className="text-xs font-medium"
        >
          View Tanks
        </Button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit && onEdit(site)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-light/50 transition-colors cursor-pointer"
            title="Edit Site"
            aria-label={`Edit ${siteName}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete && onDelete(site)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-light/50 transition-colors cursor-pointer"
            title="Delete Site"
            aria-label={`Delete ${siteName}`}
          >
            <Trash2 className="w-4 h-4 text-danger/80" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default SiteCard;
