import React from 'react';
import { Stethoscope, Container, Calendar, Scale, IndianRupee, Edit3, Trash2, FileText, Pill } from 'lucide-react';
import { Modal } from '../Modal';
import { Button } from '../Button';

/**
 * Redesigned MedicineDetailsModal component featuring clean visual sectioning:
 * SECTION: 🩺 TREATMENT DETAILS (Medicine/Chemical, Tank, Application Date, Quantity, Treatment Cost)
 * Modal title: <medicineName>
 * Subtitle: "Medicine Treatment Details"
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
      <div className="space-y-5">
        {/* SECTION — TREATMENT DETAILS */}
        <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-3 shadow-2xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary/20 pb-2">
            <Stethoscope className="w-4 h-4 text-primary" /> Treatment Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-surface p-3 rounded-lg border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
                <Pill className="w-3 h-3 text-primary" /> Medicine / Chemical
              </span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {displayMedName}
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
                <Calendar className="w-3 h-3 text-primary" /> Application Date
              </span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {formattedDate}
              </span>
            </div>

            <div className="bg-surface p-3 rounded-lg border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
                <Scale className="w-3 h-3 text-primary" /> Quantity
              </span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {numericQty}
              </span>
            </div>

            <div className="bg-surface p-3 rounded-lg border border-primary/30 bg-primary-light/20 sm:col-span-2">
              <span className="text-[10px] text-primary uppercase font-bold block flex items-center gap-1">
                <IndianRupee className="w-3 h-3 text-primary" /> Treatment Cost
              </span>
              <span className="text-base font-extrabold text-primary mt-0.5 block truncate">
                ₹{numericCost.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Application Notes (Only rendered if notes exist) */}
        {notes && (
          <div className="p-3.5 rounded-xl bg-background border border-border/60 text-xs shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1 mb-1">
              <FileText className="w-3.5 h-3.5 text-primary" /> Application Notes
            </span>
            <p className="text-text-secondary leading-relaxed">{notes}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit && onEdit(record)}
            icon={<Edit3 className="w-4 h-4" />}
            className="font-semibold"
          >
            Edit Record
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete && onDelete(record)}
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

export default MedicineDetailsModal;
