import React from 'react';
import { Calendar, Edit3, Trash2 } from 'lucide-react';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * Simplified CropDetailsModal component displaying:
 * - Header: Batch Number & Subtitle (Variety • Tank) + Status Badge
 * - CROP DETAILS: Batch Number, Seed Variety, Tank, Stocking Date
 * - CULTURE PROGRESS: DOC + Progress percentage + Simple Progress Bar
 * - Footer: Edit Crop, Delete
 */
export const CropDetailsModal = ({
  isOpen = false,
  onClose,
  crop = null,
  onEdit,
  onDelete,
}) => {
  if (!crop) return null;

  const {
    id,
    tankName,
    cropName,
    batchNumber,
    seedVariety,
    stockingDate,
    expectedHarvestDate,
    status,
    notes,
  } = crop;

  const displayBatch = batchNumber || cropName || 'Unnamed Batch';
  const displayVariety = seedVariety || 'Not specified';
  const displayTank = tankName || crop.tank?.tankName || 'Not assigned';

  // Safe Date & DOC calculation
  const now = new Date();
  const validStockingDate = stockingDate ? new Date(stockingDate) : null;
  const start = validStockingDate && !isNaN(validStockingDate.getTime()) ? validStockingDate : now;

  const validHarvestDate = expectedHarvestDate ? new Date(expectedHarvestDate) : null;
  const end = validHarvestDate && !isNaN(validHarvestDate.getTime())
    ? validHarvestDate
    : new Date(start.getTime() + 120 * 24 * 60 * 60 * 1000);

  const doc = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  const totalDurationDays = Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
  const progressPercent = Math.min(100, Math.max(0, Math.round((doc / totalDurationDays) * 100)));

  const formattedStockingDate = validStockingDate && !isNaN(validStockingDate.getTime())
    ? validStockingDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not specified';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={displayBatch}
      description={`${displayVariety} • Tank ${displayTank}`}
      size="md"
    >
      <div className="space-y-5">
        {/* Subheader & Status Badge Row */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="font-bold text-lg text-text-primary">{displayBatch}</h3>
            <p className="text-xs text-text-secondary font-medium">
              {displayVariety} • Tank {displayTank}
            </p>
          </div>
          <Badge variant={status === 'Active' ? 'success' : 'primary'} size="sm">
            {status || 'Active'}
          </Badge>
        </div>

        {/* CROP DETAILS SECTION */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Crop Details
          </h4>
          <div className="bg-background border border-border rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-text-secondary font-medium">Batch Number</span>
              <span className="font-bold text-text-primary">{displayBatch}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-text-secondary font-medium">Seed Variety</span>
              <span className="font-bold text-text-primary">{displayVariety}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-text-secondary font-medium">Tank</span>
              <span className="font-bold text-text-primary">{displayTank}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-secondary font-medium">Stocking Date</span>
              <span className="font-bold text-text-primary">{formattedStockingDate}</span>
            </div>
          </div>
        </div>

        {/* Notes (Optional - Only shown if notes exist) */}
        {notes && (
          <div className="bg-background border border-border rounded-xl p-3 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
              Notes
            </span>
            <p className="text-text-secondary leading-relaxed">{notes}</p>
          </div>
        )}

        {/* CULTURE PROGRESS SECTION */}
        <div className="space-y-2 pt-1 border-t border-border">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Culture Progress
          </h4>
          <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text-primary flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" /> Day {doc} (DOC: {doc} Days)
              </span>
              <span className="font-semibold text-primary">{progressPercent}% Complete</span>
            </div>

            <div className="w-full bg-background rounded-full h-2.5 overflow-hidden border border-border/40">
              <div
                className="bg-gradient-to-r from-primary to-teal-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit && onEdit(crop)}
            icon={<Edit3 className="w-4 h-4" />}
          >
            Edit Crop
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete && onDelete(crop)}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CropDetailsModal;
