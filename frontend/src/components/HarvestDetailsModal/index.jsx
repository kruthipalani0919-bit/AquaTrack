import React from 'react';
import { Container, Calendar, Weight, User, IndianRupee, Wheat, Edit3, Trash2 } from 'lucide-react';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { getHarvestLevelLabel } from '../HarvestCard';

/**
 * Reusable HarvestDetailsModal component.
 * Layout:
 * 1. Top Section: Tank Header, Buyer/Trader Name, Harvest Level Badge, Harvest Date, Notes.
 * 2. Bottom Highlighted Blue Section: Selling Price, Harvest Weight (kg), Shrimp Count, Harvest Expense.
 */
export const HarvestDetailsModal = ({
  isOpen,
  onClose,
  harvest,
  onEdit,
  onDelete,
}) => {
  if (!harvest) return null;

  const rawTank = harvest.tankName || harvest.crop?.tank?.tankName || harvest.crop?.tank?.name || 'A1';
  const cleanTank = rawTank.replace(/\s*\([^)]*\)/g, '').trim() || rawTank;
  const displayTank = cleanTank.toLowerCase().startsWith('tank') ? cleanTank : `Tank ${cleanTank}`;

  const harvestWeightVal = harvest.harvestWeight !== undefined && harvest.harvestWeight !== null
    ? harvest.harvestWeight
    : (harvest.production || 0);

  const shrimpCountVal = harvest.shrimpCount || 'N/A';
  const sellingPriceVal = parseFloat(harvest.sellingPrice) || 0;
  const harvestExpenseVal = parseFloat(harvest.harvestExpense || 0);

  const formattedDate = harvest.harvestDate
    ? new Date(harvest.harvestDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not specified';

  const levelLabel = getHarvestLevelLabel(harvest.harvestNumber, harvest.harvestType);
  const isFinal = harvest.harvestType === 'FINAL';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Harvest Details - ${displayTank}`}
      description="Recorded pond harvest yields and transaction details"
      size="md"
    >
      <div className="space-y-4 pt-1">
        {/* 1. TOP SECTION SEPARATELY: Tank Name Header & Harvest Level Badge */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-border/80 shadow-2xs">
          <span className="text-xs font-bold text-text-primary flex items-center gap-2">
            <Container className="w-4 h-4 text-primary" /> {displayTank}
          </span>
          <Badge variant={isFinal ? 'warning' : 'primary'} size="sm" className="font-semibold">
            {levelLabel}
          </Badge>
        </div>

        {/* BUYER & HARVEST DATE CARD */}
        <div className="p-3.5 rounded-xl bg-background border border-border/80 space-y-2.5 text-xs shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-primary" /> Buyer / Trader Name
            </span>
            <span className="font-extrabold text-text-primary text-sm">{harvest.buyerName || 'Not specified'}</span>
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-2">
            <span className="text-text-secondary flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-primary" /> Harvest Date
            </span>
            <span className="font-bold text-text-primary">{formattedDate}</span>
          </div>
        </div>

        {/* NOTES & REMARKS (IF PROVIDED) */}
        {harvest.notes && String(harvest.notes).trim() && (
          <div className="p-3 rounded-xl bg-background border border-border/60 text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider block">
              Notes & Remarks
            </span>
            <p className="text-text-primary font-medium">{harvest.notes}</p>
          </div>
        )}

        {/* 2. BLUE HIGHLIGHTED SECTION AT BOTTOM: Selling Price, Harvest Weight, Shrimp Count, Harvest Expense */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 shadow-2xs space-y-3">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
            <Wheat className="w-3.5 h-3.5 text-blue-700" /> Harvest Transaction Summary
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Harvest Weight (kg) */}
            <div className="p-3 rounded-lg bg-white/90 border border-blue-100 shadow-2xs space-y-0.5">
              <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider block">
                Harvest Weight
              </span>
              <span className="text-sm font-extrabold text-primary block">
                {harvestWeightVal} kg
              </span>
            </div>

            {/* Shrimp Count */}
            <div className="p-3 rounded-lg bg-white/90 border border-blue-100 shadow-2xs space-y-0.5">
              <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider block">
                Shrimp Count
              </span>
              <span className="text-sm font-extrabold text-text-primary block">
                {shrimpCountVal}
              </span>
            </div>

            {/* Selling Price */}
            <div className="p-3 rounded-lg bg-white/90 border border-blue-100 shadow-2xs space-y-0.5">
              <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider block">
                Selling Price
              </span>
              <span className="text-sm font-extrabold text-teal-700 block">
                ₹{sellingPriceVal}/kg
              </span>
            </div>

            {/* Harvest Expense */}
            <div className="p-3 rounded-lg bg-white/90 border border-blue-100 shadow-2xs space-y-0.5">
              <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider block">
                Harvest Expense
              </span>
              <span className="text-sm font-extrabold text-amber-700 block">
                ₹{harvestExpenseVal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* 3. FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/80">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(harvest)}
              icon={<Edit3 className="w-4 h-4" />}
            >
              Edit Record
            </Button>
          )}

          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(harvest)}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default HarvestDetailsModal;
