import React from 'react';
import { Stethoscope, Container, Sprout, Calendar, Clock, Eye, Edit3, Trash2 } from 'lucide-react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * Reusable MedicineCard component displaying treatment parameters,
 * category, dosage, cost, status badge, and action triggers.
 */
export const MedicineCard = ({
  record = {},
  onView,
  onEdit,
  onDelete,
  className = '',
}) => {
  const {
    id,
    cropName,
    tankName,
    medicineName,
    category,
    dosage,
    unit,
    applicationDate,
    applicationTime,
    cost,
    purpose,
    status,
  } = record;

  const displayMedName = medicineName || 'Treatment';
  const displayCategory = category || 'General';
  const displayCrop = cropName || 'Crop';
  const displayTank = tankName || 'Tank';
  const displayDosage = dosage || '1';
  const displayUnit = unit || 'kg/ha';
  const displayDate = applicationDate || 'Today';
  const displayTime = applicationTime || 'Morning';
  const numericCost = parseFloat(cost) || 0;

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
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-text-primary truncate tracking-tight" title={displayMedName}>
              {displayMedName}
            </h3>
            <span className="text-[11px] font-semibold text-text-secondary truncate block">
              {displayCategory}
            </span>
          </div>
        </div>

        <Badge variant={statusVariantMap[status] || 'primary'} size="sm" className="shrink-0">
          {status || 'Completed'}
        </Badge>
      </div>

      {/* Linked Location Row */}
      <div className="flex items-center gap-3 py-2.5 text-xs border-b border-border/40 text-text-secondary">
        <span className="flex items-center gap-1 font-medium truncate">
          <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">{displayCrop}</span>
        </span>
        <span className="flex items-center gap-1 font-medium truncate">
          <Container className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">{displayTank}</span>
        </span>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 py-3 border-b border-border/60 text-center">
        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Dosage Amount</span>
          <span className="text-xs sm:text-sm font-bold text-text-primary mt-0.5">
            {displayDosage} <span className="text-[10px] font-normal text-text-secondary">{displayUnit}</span>
          </span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-lg bg-background/60 border border-border/40">
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">Treatment Cost</span>
          <span className="text-xs sm:text-sm font-bold text-emerald-700 mt-0.5">
            ₹{numericCost.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Application Date & Time */}
      <div className="py-2.5 flex items-center justify-between text-xs text-text-secondary border-b border-border/40">
        <span className="flex items-center gap-1 font-medium">
          <Calendar className="w-3.5 h-3.5 text-primary" /> {displayDate}
        </span>
        <span className="flex items-center gap-1 font-medium">
          <Clock className="w-3.5 h-3.5 text-accent" /> {displayTime}
        </span>
      </div>

      {/* Purpose snippet */}
      {purpose && (
        <p className="text-[11px] text-text-secondary py-2 border-b border-border/40 line-clamp-1 italic">
          "{purpose}"
        </p>
      )}

      {/* Card Actions Footer */}
      <div className="pt-3 flex items-center justify-between gap-2 mt-auto border-t border-border/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView && onView(record)}
          icon={<Eye className="w-4 h-4 text-primary" />}
          className="text-xs text-primary font-medium"
        >
          View Details
        </Button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit && onEdit(record)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-light/50 transition-colors"
            title="Edit Treatment Record"
            aria-label="Edit treatment record"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete && onDelete(record)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-light/50 transition-colors"
            title="Delete Treatment Record"
            aria-label="Delete treatment record"
          >
            <Trash2 className="w-4 h-4 text-danger/80" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default MedicineCard;
