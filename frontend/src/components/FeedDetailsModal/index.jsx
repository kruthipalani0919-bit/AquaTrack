import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { Modal } from '../Modal';
import { Button } from '../Button';

/**
 * Simplified FeedDetailsModal component displaying ONLY recorded feed specifications:
 * Feed Brand, Feed Type, Tank, Feeding Date, Quantity, Cost per Kg, Total Cost, and Notes.
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
      title={displayBrand}
      description={`Feed Record (${displayType})`}
      size="md"
    >
      <div className="space-y-4">
        {/* Specifications List */}
        <div className="bg-background border border-border rounded-xl p-4 space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-border/40">
            <span className="text-text-secondary font-medium">Feed Brand</span>
            <span className="font-bold text-text-primary">{displayBrand}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-border/40">
            <span className="text-text-secondary font-medium">Feed Type</span>
            <span className="font-bold text-text-primary">{displayType}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-border/40">
            <span className="text-text-secondary font-medium">Tank</span>
            <span className="font-bold text-text-primary">{displayTank}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-border/40">
            <span className="text-text-secondary font-medium">Feeding Date</span>
            <span className="font-bold text-text-primary">{formattedDate}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-border/40">
            <span className="text-text-secondary font-medium">Quantity</span>
            <span className="font-bold text-text-primary">{numericQty} kg</span>
          </div>

          <div className="flex justify-between py-1 border-b border-border/40">
            <span className="text-text-secondary font-medium">Cost per Kg</span>
            <span className="font-bold text-text-primary">₹{numericCostPerKg}</span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-text-secondary font-medium">Total Cost</span>
            <span className="font-bold text-emerald-700">₹{totalCost.toLocaleString()}</span>
          </div>
        </div>

        {/* Notes (Only rendered if notes exist) */}
        {notes && (
          <div className="bg-background border border-border rounded-xl p-3 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
              Notes
            </span>
            <p className="text-text-secondary leading-relaxed">{notes}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit && onEdit(feedLog)}
            icon={<Edit3 className="w-4 h-4" />}
          >
            Edit Feed
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete && onDelete(feedLog)}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FeedDetailsModal;
