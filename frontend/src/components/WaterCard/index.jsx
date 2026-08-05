import React from 'react';
import { Waves, Container, Calendar, Clock, Eye, Edit3, Trash2, Thermometer, Activity } from 'lucide-react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * Reusable WaterCard component displaying 8 core water parameters,
 * status badge (Normal/Warning/Critical), and action buttons.
 */
export const WaterCard = ({
  record,
  onView,
  onEdit,
  onDelete,
  className = '',
}) => {
  const {
    id,
    tankName,
    testDate,
    testTime,
    ph,
    temperature,
    dissolvedOxygen,
    salinity,
    ammonia,
    nitrite,
    alkalinity,
    waterLevel,
    status,
  } = record;

  const statusVariantMap = {
    Normal: 'success',
    Warning: 'warning',
    Critical: 'danger',
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
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-xs">
            <Waves className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-text-primary truncate tracking-tight" title={tankName}>
              {tankName}
            </h3>
            <span className="text-[11px] text-text-secondary flex items-center gap-2 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-primary shrink-0" /> {testDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-accent shrink-0" /> {testTime}
              </span>
            </span>
          </div>
        </div>

        <Badge variant={statusVariantMap[status] || 'primary'} size="sm" className="shrink-0">
          {status}
        </Badge>
      </div>

      {/* 8 Core Parameters Grid */}
      <div className="grid grid-cols-4 gap-2 py-3 border-b border-border/60 text-center">
        <div className="flex flex-col items-center p-1.5 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[9px] uppercase font-semibold text-text-secondary tracking-wider">pH</span>
          <span className={`text-xs font-bold mt-0.5 ${ph < 7.5 || ph > 8.5 ? 'text-warning' : 'text-text-primary'}`}>
            {ph}
          </span>
        </div>

        <div className="flex flex-col items-center p-1.5 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[9px] uppercase font-semibold text-text-secondary tracking-wider">Temp</span>
          <span className="text-xs font-bold text-text-primary mt-0.5">
            {temperature}°C
          </span>
        </div>

        <div className="flex flex-col items-center p-1.5 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[9px] uppercase font-semibold text-text-secondary tracking-wider">DO</span>
          <span className={`text-xs font-bold mt-0.5 ${dissolvedOxygen < 5.0 ? 'text-danger' : 'text-emerald-700'}`}>
            {dissolvedOxygen} <span className="text-[9px] font-normal text-text-secondary">mg/L</span>
          </span>
        </div>

        <div className="flex flex-col items-center p-1.5 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[9px] uppercase font-semibold text-text-secondary tracking-wider">Salinity</span>
          <span className="text-xs font-bold text-text-primary mt-0.5">
            {salinity} <span className="text-[9px] font-normal text-text-secondary">ppt</span>
          </span>
        </div>

        <div className="flex flex-col items-center p-1.5 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[9px] uppercase font-semibold text-text-secondary tracking-wider">TAN</span>
          <span className={`text-xs font-bold mt-0.5 ${ammonia > 0.1 ? 'text-danger' : 'text-text-primary'}`}>
            {ammonia} <span className="text-[9px] font-normal text-text-secondary">ppm</span>
          </span>
        </div>

        <div className="flex flex-col items-center p-1.5 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[9px] uppercase font-semibold text-text-secondary tracking-wider">NO2</span>
          <span className={`text-xs font-bold mt-0.5 ${nitrite > 0.2 ? 'text-warning' : 'text-text-primary'}`}>
            {nitrite} <span className="text-[9px] font-normal text-text-secondary">ppm</span>
          </span>
        </div>

        <div className="flex flex-col items-center p-1.5 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[9px] uppercase font-semibold text-text-secondary tracking-wider">Alk.</span>
          <span className="text-xs font-bold text-text-primary mt-0.5">
            {alkalinity} <span className="text-[9px] font-normal text-text-secondary">ppm</span>
          </span>
        </div>

        <div className="flex flex-col items-center p-1.5 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[9px] uppercase font-semibold text-text-secondary tracking-wider">Level</span>
          <span className="text-xs font-bold text-text-primary mt-0.5">
            {waterLevel} <span className="text-[9px] font-normal text-text-secondary">m</span>
          </span>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-3 flex items-center justify-between gap-2 mt-auto border-t border-border/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(record)}
          icon={<Eye className="w-4 h-4 text-primary" />}
          className="text-xs text-primary font-medium"
        >
          View Check
        </Button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(record)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-light/50 transition-colors"
            title="Edit Water Check"
            aria-label="Edit water check"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(record)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-light/50 transition-colors"
            title="Delete Water Check"
            aria-label="Delete water check"
          >
            <Trash2 className="w-4 h-4 text-danger/80" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default WaterCard;
