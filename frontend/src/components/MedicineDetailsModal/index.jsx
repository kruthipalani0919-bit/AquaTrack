import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { Modal } from '../Modal';
import { Button } from '../Button';

/**
 * Simplified MedicineDetailsModal component displaying ONLY recorded treatment parameters:
 * Medicine / Chemical Name, Tank, Application Date, Quantity, Treatment Cost, and Notes (if present).
 * Prevents any 'undefined • undefined' rendering.
 */
export const MedicineDetailsModal = ({
  isOpen = false,
  onClose,
  record = null,
  onEdit,
  onDelete,
}) => {
  if (!record) return null;

  const {
    id,
    tankName,
    medicineName,
    quantity,
    cost,
    applicationDate,
    date,
    notes,
  } = record;

  const displayMedName = medicineName || 'Treatment Record';

  // Safely format tank name to NEVER display water source
  const rawTank = tankName || record?.tank?.name || record?.tank?.tankName || 'Not assigned';
  const displayTank = rawTank.replace(/\s*\([^)]*\)/g, '').trim() || rawTank;

  const numericQty = parseFloat(quantity) || 0;
  const numericCost = parseFloat(cost) || 0;

  const validDate = applicationDate || date;
  const formattedDate = validDate
    ? new Date(validDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not specified';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={displayMedName}
      description="Medicine Treatment Details"
      size="md"
    >
      <div className="space-y-4">
        {/* Specifications List */}
        <div className="bg-background border border-border rounded-xl p-4 space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-border/40">
            <span className="text-text-secondary font-medium">Medicine / Chemical</span>
            <span className="font-bold text-text-primary">{displayMedName}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-border/40">
            <span className="text-text-secondary font-medium">Tank</span>
            <span className="font-bold text-text-primary">{displayTank}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-border/40">
            <span className="text-text-secondary font-medium">Application Date</span>
            <span className="font-bold text-text-primary">{formattedDate}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-border/40">
            <span className="text-text-secondary font-medium">Quantity</span>
            <span className="font-bold text-text-primary">{numericQty}</span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-text-secondary font-medium">Treatment Cost</span>
            <span className="font-bold text-emerald-700">₹{numericCost.toLocaleString()}</span>
          </div>
        </div>

        {/* Application Notes (Only rendered if notes exist) */}
        {notes && (
          <div className="bg-background border border-border rounded-xl p-3 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
              Application Notes
            </span>
            <p className="text-text-secondary leading-relaxed">{notes}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit && onEdit(record)}
            icon={<Edit3 className="w-4 h-4" />}
          >
            Edit Record
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete && onDelete(record)}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MedicineDetailsModal;
