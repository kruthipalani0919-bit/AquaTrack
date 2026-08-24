import React from 'react';
import { Sprout, Container, Calendar, Edit3, Trash2, FileText } from 'lucide-react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { Badge } from '../Badge';

/**
 * Redesigned CropDetailsModal component with clean visual sectioning:
 * Section 1: 🌱 Crop Information (Batch Number, Seed Variety)
 * Section 2: 🧺 Tank & Stocking (Tank, Stocking Date)
 * Section 3: Current Status ([ Active ])
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
    seedQuantity,
    seedVariety,
    stockingDate,
    status,
    notes,
  } = crop;

  const rawBatch = batchNumber || cropName || '';
  const cleanBatchNum = rawBatch.replace(/^batch\s*/i, '').trim() || rawBatch || 'N/A';
  const displayTitle = `Batch ${cleanBatchNum}`;
  const displayVariety = seedVariety || 'Not specified';

  // Format tank name cleanly to NEVER display water source
  const rawTank = tankName || crop.tank?.name || crop.tank?.tankName || 'Not assigned';
  const displayTank = rawTank.replace(/\s*\([^)]*\)/g, '').trim() || rawTank;

  const validStockingDate = stockingDate ? new Date(stockingDate) : null;
  const formattedStockingDate = validStockingDate && !isNaN(validStockingDate.getTime())
    ? validStockingDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not specified';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={displayTitle}
      description="Crop Batch Details"
      size="md"
    >
      <div className="space-y-5">
        {/* SECTION 1 — CROP INFORMATION */}
        <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-3 shadow-2xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary/20 pb-2">
            <Sprout className="w-4 h-4 text-primary" /> Crop Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-surface p-3 rounded-lg border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block">Batch Number</span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {cleanBatchNum}
              </span>
            </div>

            <div className="bg-surface p-3 rounded-lg border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block">Seed Quantity</span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {seedQuantity != null ? `${seedQuantity} kg` : 'Not specified'}
              </span>
            </div>

            <div className="bg-surface p-3 rounded-lg border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block">Seed Variety</span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {displayVariety}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2 — TANK & STOCKING */}
        <div className="p-4 rounded-xl bg-background border border-border/80 space-y-3 shadow-2xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5 border-b border-border/60 pb-2">
            <Container className="w-4 h-4 text-primary" /> Tank & Stocking
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
                <Calendar className="w-3 h-3 text-primary" /> Stocking Date
              </span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {formattedStockingDate}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3 — CURRENT STATUS */}
        <div className="p-4 rounded-xl bg-background border border-border/80 space-y-2 shadow-2xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary block">
            Current Status
          </h4>
          <div>
            <Badge variant="success" size="md" className="font-semibold text-xs px-3 py-1">
              {status || 'Active'}
            </Badge>
          </div>
        </div>

        {/* Notes (Optional - Only shown if present) */}
        {notes && (
          <div className="p-3.5 rounded-xl bg-background border border-border/60 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1 mb-1">
              <FileText className="w-3.5 h-3.5 text-primary" /> Notes
            </span>
            <p className="text-text-secondary leading-relaxed">{notes}</p>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit && onEdit(crop)}
            icon={<Edit3 className="w-4 h-4" />}
            className="font-semibold"
          >
            Edit Crop
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete && onDelete(crop)}
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

export default CropDetailsModal;
