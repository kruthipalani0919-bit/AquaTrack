import React from 'react';
import { Stethoscope, Container, Calendar, Eye, Edit3, Trash2 } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';

/**
 * Reusable MedicineCard component displaying simplified treatment details:
 * Medicine / Chemical Name, Tank, Application Date, Quantity, Treatment Cost, and Notes (if present).
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
    tankName,
    medicineName,
    quantity,
    cost,
    applicationDate,
    date,
    notes,
  } = record || {};

  const displayMedName = medicineName || 'Treatment Record';

  // Safely format tank name to NEVER display water source
  const rawTank = tankName || record?.tank?.name || record?.tank?.tankName || 'Tank';
  const displayTank = rawTank.replace(/\s*\([^)]*\)/g, '').trim() || rawTank;

  const numericQty = parseFloat(quantity) || 0;
  const numericCost = parseFloat(cost) || 0;

  const validDate = applicationDate || date;
  const formattedDate = validDate
    ? new Date(validDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not specified';

  return (
    <Card
      hoverEffect={true}
      padding="normal"
      className={`flex flex-col justify-between border-border/80 bg-surface shadow-xs transition-all ${className}`}
    >
      {/* Header Row: Medicine Name */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-base text-text-primary truncate tracking-tight" title={displayMedName}>
              {displayMedName}
            </h3>
            <span className="text-xs text-text-secondary flex items-center gap-1 mt-0.5 font-medium">
              <Container className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">Tank: {displayTank}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Application Date & Specs */}
      <div className="py-3 border-b border-border/60 space-y-1.5 text-xs text-text-secondary">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-primary" /> Application Date:
          </span>
          <span className="font-semibold text-text-primary">{formattedDate}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Quantity:</span>
          <span className="font-semibold text-text-primary">{numericQty}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Treatment Cost:</span>
          <span className="font-semibold text-emerald-700">₹{numericCost.toLocaleString()}</span>
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
          onClick={() => onView && onView(record)}
          icon={<Eye className="w-4 h-4 text-primary" />}
          className="text-xs font-medium"
        >
          View Details
        </Button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit && onEdit(record)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-light/50 transition-colors cursor-pointer"
            title="Edit Treatment Record"
            aria-label="Edit treatment record"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete && onDelete(record)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-light/50 transition-colors cursor-pointer"
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
