import React from 'react';
import { Stethoscope, Eye, Edit3, Trash2 } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';

/**
 * Reusable MedicineCard component matching the visual language, structure, padding,
 * icon container, typography, and button styling of TankCard:
 * - Header: Medicine Icon in pastel container, Medicine Name (e.g. probiotic), Tank Subtitle (e.g. Tank A1) directly below.
 * - Information Area: Clean specification box for Application Date, Quantity, and Treatment Cost (highlighted).
 * - Footer Actions: View Details (primary outline button), Edit & Delete icon triggers.
 */
export const MedicineCard = ({
  record = {},
  onView,
  onViewDetails,
  onEdit,
  onDelete,
  className = '',
}) => {
  const handleView = onViewDetails || onView;
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

  // Clean tank name: e.g. "Tank A1" without "Tank: A1" prefix or water source string
  const rawTank = tankName || record?.tank?.name || record?.tank?.tankName || 'A1';
  const cleanTank = rawTank.replace(/\s*\([^)]*\)/g, '').trim() || rawTank;
  const tankLabel = cleanTank.toLowerCase().startsWith('tank') ? cleanTank : `Tank ${cleanTank}`;

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
      {/* 1. TOP HEADER ROW: Icon, Medicine Name & Tank Subtitle */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-xs">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-base text-text-primary truncate tracking-tight" title={displayMedName}>
              {displayMedName}
            </h3>
            <p className="text-xs text-text-secondary font-medium truncate mt-0.5" title={tankLabel}>
              {tankLabel}
            </p>
          </div>
        </div>
      </div>

      {/* 2. INFORMATION SPECIFICATION BOX */}
      <div className="py-4 border-b border-border/60">
        <div className="flex flex-col items-start p-3 rounded-lg bg-background/60 border border-border/40 space-y-2">
          <div className="w-full flex items-center justify-between text-xs">
            <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">
              Application Date
            </span>
            <span className="font-bold text-text-primary truncate ml-2">
              {formattedDate}
            </span>
          </div>

          <div className="w-full flex items-center justify-between text-xs">
            <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">
              Quantity
            </span>
            <span className="font-bold text-text-primary truncate ml-2">
              {numericQty}
            </span>
          </div>

          <div className="w-full flex items-center justify-between text-xs pt-1.5 border-t border-border/40">
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
              Treatment Cost
            </span>
            <span className="font-extrabold text-primary truncate ml-2">
              ₹{numericCost.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. CARD ACTIONS FOOTER */}
      <div className="pt-3 flex items-center justify-between gap-2 mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleView && handleView(record)}
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
            aria-label={`Edit ${displayMedName}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete && onDelete(record)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-light/50 transition-colors cursor-pointer"
            title="Delete Treatment Record"
            aria-label={`Delete ${displayMedName}`}
          >
            <Trash2 className="w-4 h-4 text-danger/80" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default MedicineCard;
