import React from 'react';
import { UtensilsCrossed, Scale, Edit3, Trash2, FileText, Container, Calendar, Tag } from 'lucide-react';
import { Modal } from '../Modal';
import { Button } from '../Button';

/**
 * Redesigned FeedDetailsModal component featuring clean visual sectioning:
 * Section 1: 🍽️ FEED INFORMATION (Feed Brand, Feed Type, Tank, Feeding Date)
 * Section 2: ⚖️ QUANTITY & COST (Quantity, Cost per Kg, Total Cost)
 * Modal title: "Feed Details"
 * Subtitle: "View feed usage and cost details."
 */
export const FeedDetailsModal = ({
  isOpen = false,
  onClose,
  feedLog = null,
  onEdit,
  onDelete,
}) => {
  if (!feedLog) return null;

  const {
    id,
    tankName,
    feedBrand,
    feedType,
    quantity,
    quantityKg,
    costPerKg,
    pricePerKg,
    feedCost,
    date,
    feedingDate,
    notes,
  } = feedLog;

  const displayBrand = feedBrand || 'Not specified';
  const displayType = feedType || 'Not specified';

  // Safely format tank name to NEVER display water source
  const rawTank = tankName || feedLog?.tank?.name || feedLog?.tank?.tankName || 'Not assigned';
  const displayTank = rawTank.replace(/\s*\([^)]*\)/g, '').trim() || rawTank;

  const numericQty = parseFloat(quantity ?? quantityKg) || 0;
  const numericCostPerKg = parseFloat(costPerKg ?? pricePerKg ?? (feedCost && numericQty ? feedCost / numericQty : 0)) || 0;
  const totalCost = feedCost ? parseFloat(feedCost) : numericQty * numericCostPerKg;

  const validDate = feedingDate || date;
  const formattedDate = validDate
    ? new Date(validDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not specified';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Feed Details"
      description="View feed usage and cost details."
      size="md"
    >
      <div className="space-y-5">
        {/* SECTION 1 — FEED INFORMATION */}
        <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-3 shadow-2xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary/20 pb-2">
            <UtensilsCrossed className="w-4 h-4 text-primary" /> Feed Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-surface p-3 rounded-lg border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
                <Tag className="w-3 h-3 text-primary" /> Feed Brand
              </span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {displayBrand}
              </span>
            </div>

            <div className="bg-surface p-3 rounded-lg border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
                <UtensilsCrossed className="w-3 h-3 text-primary" /> Feed Type
              </span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {displayType}
              </span>
            </div>

            <div className="bg-surface p-3 rounded-lg border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
                <Container className="w-3 h-3 text-primary" /> Tank
              </span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {displayTank}
              </span>
            </div>

            <div className="bg-surface p-3 rounded-lg border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-primary" /> Feeding Date
              </span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2 — QUANTITY & COST */}
        <div className="p-4 rounded-xl bg-background border border-border/80 space-y-3 shadow-2xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5 border-b border-border/60 pb-2">
            <Scale className="w-4 h-4 text-primary" /> Quantity & Cost
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-surface p-3 rounded-lg border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block">Quantity</span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {numericQty} kg
              </span>
            </div>

            <div className="bg-surface p-3 rounded-lg border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block">Cost per Kg</span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                ₹{numericCostPerKg}
              </span>
            </div>

            <div className="bg-surface p-3 rounded-lg border border-primary/30 bg-primary-light/20">
              <span className="text-[10px] text-primary uppercase font-bold block">Total Cost</span>
              <span className="text-sm font-extrabold text-primary mt-0.5 block truncate">
                ₹{totalCost.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Notes (Only rendered if notes exist) */}
        {notes && (
          <div className="p-3.5 rounded-xl bg-background border border-border/60 text-xs shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1 mb-1">
              <FileText className="w-3.5 h-3.5 text-primary" /> Notes
            </span>
            <p className="text-text-secondary leading-relaxed">{notes}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit && onEdit(feedLog)}
            icon={<Edit3 className="w-4 h-4" />}
            className="font-semibold"
          >
            Edit Feed
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete && onDelete(feedLog)}
            icon={<Trash2 className="w-4 h-4" />}
            className="font-semibold"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FeedDetailsModal;
