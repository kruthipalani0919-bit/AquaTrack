import React from 'react';
import {
  Container,
  User,
  Calendar,
  Fish,
  Scale,
  TrendingUp,
  Receipt,
  FileText,
  Edit3,
  Trash2
} from 'lucide-react';
import { Modal } from '../Modal';
import { Button } from '../Button';

/**
 * HarvestDetailsModal component:
 * - TOP SECTION (Normal Surface): Tank, Buyer Name, Harvest Date.
 * - BOTTOM HIGHLIGHTED SECTION (Teal/Blue): Shrimp Count, ABW, Selling Price (/kg), Harvest Expense.
 * - Edit Record and Delete action buttons at bottom.
 */
export const HarvestDetailsModal = ({
  isOpen,
  onClose,
  harvest,
  onEdit,
  onDelete,
}) => {
  if (!harvest) return null;

  const displayBuyer = harvest.buyerName || 'Direct Market Buyer';
  const rawTank = harvest.tankName || harvest.tank?.name || harvest.tank?.tankName || 'Not assigned';
  const displayTank = rawTank.replace(/\s*\([^)]*\)/g, '').trim() || rawTank;

  const numericShrimpCount = parseFloat(harvest.shrimpCount) || 0;
  const numericAbw = parseFloat(harvest.averageWeight) || 0;
  const numericPrice = parseFloat(harvest.sellingPrice) || 0;
  const numericExpense = parseFloat(harvest.harvestExpense) || 0;

  const formattedDate = harvest.harvestDate
    ? new Date(harvest.harvestDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not specified';

  const handleEditClick = () => {
    onClose();
    if (onEdit) onEdit(harvest);
  };

  const handleDeleteClick = () => {
    onClose();
    if (onDelete) onDelete(harvest);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Harvest Details"
      description="Harvest transaction details"
      size="md"
    >
      <div className="space-y-4">
        {/* 1. TOP SECTION — NORMAL / SIMPLE DETAILS (Surface Background) */}
        <div className="p-4 rounded-xl bg-surface border border-border/80 space-y-3 shadow-2xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5 border-b border-border/60 pb-2">
            <FileText className="w-4 h-4 text-text-secondary" /> RECORD DETAILS
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Tank */}
            <div className="p-3 rounded-lg bg-background border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
                <Container className="w-3 h-3 text-text-secondary" /> Tank
              </span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {displayTank}
              </span>
            </div>

            {/* Buyer Name */}
            <div className="p-3 rounded-lg bg-background border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
                <User className="w-3 h-3 text-text-secondary" /> Buyer Name
              </span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {displayBuyer}
              </span>
            </div>

            {/* Harvest Date */}
            <div className="p-3 rounded-lg bg-background border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-text-secondary" /> Harvest Date
              </span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* 2. BOTTOM HIGHLIGHTED SECTION — HARVEST PERFORMANCE & METRICS (Teal/Blue) */}
        <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-3.5 shadow-2xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary/20 pb-2">
            <Receipt className="w-4 h-4 text-primary" /> HARVEST PERFORMANCE & FINANCIAL DETAILS
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Shrimp Count */}
            <div className="bg-surface p-3 rounded-lg border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
                <Fish className="w-3 h-3 text-primary" /> Shrimp Count
              </span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {numericShrimpCount > 0 ? numericShrimpCount.toLocaleString() : 'N/A'}
              </span>
            </div>

            {/* Average Weight (ABW) */}
            <div className="bg-surface p-3 rounded-lg border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
                <Scale className="w-3 h-3 text-primary" /> Average Weight (ABW)
              </span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {numericAbw} g
              </span>
            </div>

            {/* Selling Price (/kg) */}
            <div className="bg-surface p-3 rounded-lg border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-primary" /> Selling Price (/kg)
              </span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                ₹{numericPrice}
              </span>
            </div>

            {/* Harvest Expense */}
            <div className="bg-surface p-3 rounded-lg border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
                <Receipt className="w-3 h-3 text-primary" /> Harvest Expense
              </span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                ₹{numericExpense.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Notes (Rendered if exist) */}
        {harvest.notes && (
          <div className="p-3.5 rounded-xl bg-background border border-border/60 text-xs shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1 mb-1">
              <FileText className="w-3.5 h-3.5 text-text-secondary" /> Notes
            </span>
            <p className="text-text-secondary leading-relaxed">{harvest.notes}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              icon={<Edit3 className="w-4 h-4" />}
              className="font-semibold"
            >
              Edit Record
            </Button>
          )}

          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteClick}
              icon={<Trash2 className="w-4 h-4" />}
              className="font-semibold"
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
