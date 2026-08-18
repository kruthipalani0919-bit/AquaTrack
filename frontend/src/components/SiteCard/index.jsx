import React from 'react';
import { MapPin, Navigation, Container, Edit3, Trash2, ArrowRight } from 'lucide-react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * Reusable SiteCard component for displaying Site summary details,
 * location info, associated tank counts, and action buttons.
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
    district,
    state,
    gpsLocation,
    remarks,
    tanks,
    _count,
  } = site;

  const tankCount = Array.isArray(tanks) ? tanks.length : (_count?.tanks || 0);

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
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-text-primary truncate tracking-tight" title={siteName}>
              {siteName}
            </h3>
            <span className="text-[11px] text-text-secondary flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">{location}</span>
            </span>
          </div>
        </div>

        <Badge variant="primary" size="sm" className="shrink-0 flex items-center gap-1">
          <Container className="w-3 h-3" />
          {tankCount} {tankCount === 1 ? 'Tank' : 'Tanks'}
        </Badge>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 py-4 border-b border-border/60 text-center">
        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40 min-w-0">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider truncate">
            District
          </span>
          <span className="text-xs font-bold text-text-primary mt-0.5 truncate w-full" title={district}>
            {district}
          </span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40 min-w-0">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider truncate">
            State
          </span>
          <span className="text-xs font-bold text-text-primary mt-0.5 truncate w-full" title={state}>
            {state}
          </span>
        </div>
      </div>

      {/* GPS & Remarks */}
      {(gpsLocation || remarks) && (
        <div className="py-3 text-xs text-text-secondary space-y-1">
          {gpsLocation && (
            <div className="flex items-center gap-1.5 text-[11px] text-text-secondary truncate">
              <Navigation className="w-3 h-3 text-primary shrink-0" />
              <span className="font-medium truncate">{gpsLocation}</span>
            </div>
          )}
          {remarks && (
            <p className="line-clamp-2 leading-relaxed text-xs">
              <span className="font-semibold text-text-primary">Note: </span>
              {remarks}
            </p>
          )}
        </div>
      )}

      {/* Card Actions Footer */}
      <div className="pt-3 flex items-center justify-between gap-2 mt-auto border-t border-border/40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewTanks && onViewTanks(site)}
          icon={<Container className="w-3.5 h-3.5 text-primary" />}
          className="text-xs font-medium"
        >
          View Tanks
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit && onEdit(site)}
            icon={<Edit3 className="w-3.5 h-3.5" />}
            title="Edit Site"
            aria-label="Edit Site"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete && onDelete(site)}
            icon={<Trash2 className="w-3.5 h-3.5 text-danger" />}
            className="hover:bg-danger-light/20 text-danger"
            title="Delete Site"
            aria-label="Delete Site"
          />
        </div>
      </div>
    </Card>
  );
};

export default SiteCard;
