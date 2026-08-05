import React from 'react';
import { Stethoscope, Container, Sprout, Calendar, Clock, IndianRupee, Edit3, Trash2, ShieldAlert } from 'lucide-react';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * Reusable MedicineDetailsModal component displaying complete treatment record specifications.
 */
export const MedicineDetailsModal = ({
  isOpen = false,
  onClose,
  record,
  onEdit,
  onDelete,
}) => {
  if (!record) return null;

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
    notes,
  } = record;

  const statusVariantMap = {
    Completed: 'success',
    Scheduled: 'warning',
    Missed: 'danger',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={medicineName}
      description={`${category} • ${cropName}`}
      size="md"
    >
      <div className="space-y-6">
        {/* Status Badge Row */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border">
          <span className="text-xs font-semibold text-text-secondary">Treatment Application Status</span>
          <Badge variant={statusVariantMap[status] || 'primary'}>
            {status}
          </Badge>
        </div>

        {/* Location & Crop Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-surface border border-border flex items-center gap-2.5">
            <Sprout className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block">Crop Batch</span>
              <span className="text-xs font-bold text-text-primary truncate block">{cropName}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border flex items-center gap-2.5">
            <Container className="w-5 h-5 text-primary shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block">Pond / Tank</span>
              <span className="text-xs font-bold text-text-primary truncate block">{tankName}</span>
            </div>
          </div>
        </div>

        {/* Key Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-surface border border-border">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Dosage Amount</span>
            <span className="text-sm font-bold text-text-primary mt-0.5 block">{dosage} {unit}</span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] text-emerald-800 uppercase font-semibold block">Treatment Cost</span>
            <span className="text-sm font-bold text-emerald-800 mt-0.5 block">
              ₹{(parseFloat(cost) || 0).toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Application Date</span>
            <span className="text-xs font-bold text-text-primary mt-0.5 block">{applicationDate}</span>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Time Slot</span>
            <span className="text-xs font-bold text-text-primary mt-0.5 block">{applicationTime}</span>
          </div>
        </div>

        {/* Purpose */}
        {purpose && (
          <div className="p-3.5 rounded-xl bg-background border border-border">
            <span className="text-xs font-bold text-text-primary block mb-1">Treatment Purpose</span>
            <p className="text-xs text-text-secondary leading-relaxed">{purpose}</p>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="p-3.5 rounded-xl bg-background border border-border">
            <span className="text-xs font-bold text-text-primary block mb-1">Application Notes & Observations</span>
            <p className="text-xs text-text-secondary leading-relaxed">{notes}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(record)}
            icon={<Edit3 className="w-4 h-4" />}
          >
            Edit Record
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(record)}
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
