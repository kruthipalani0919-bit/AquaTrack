import React from 'react';
import { Wheat, Container, Calendar, Weight, User, IndianRupee, Truck, Edit3, Trash2 } from 'lucide-react';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * Reusable HarvestDetailsModal component to view full harvest record details.
 */
export const HarvestDetailsModal = ({
  isOpen,
  onClose,
  harvest,
  onEdit,
  onDelete,
}) => {
  if (!harvest) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Harvest Details - ${harvest.tankName || 'Tank'}`}
      description="Harvest yield metrics and transaction details"
      size="md"
    >
      <div className="space-y-6">
        {/* Header Tank & Buyer */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border">
          <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            <Container className="w-4 h-4 text-primary" /> {harvest.tankName || 'Tank 1'}
          </span>
          <Badge variant="success">
            Harvested
          </Badge>
        </div>

        {/* Spec Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-surface border border-border">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Production</span>
            <span className="text-sm font-extrabold text-text-primary mt-1 block">{harvest.production} kg</span>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Avg Weight (ABW)</span>
            <span className="text-sm font-extrabold text-text-primary mt-1 block">{harvest.averageWeight} g</span>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Survival Rate</span>
            <span className="text-sm font-extrabold text-emerald-700 mt-1 block">{harvest.survivalRate}%</span>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Selling Price</span>
            <span className="text-sm font-extrabold text-primary mt-1 block">₹{harvest.sellingPrice}/kg</span>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Transport Cost</span>
            <span className="text-sm font-bold text-text-primary mt-1 block">₹{harvest.transportationCost}</span>
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border">
            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Harvest Expense</span>
            <span className="text-sm font-bold text-text-primary mt-1 block">₹{harvest.harvestExpense}</span>
          </div>
        </div>

        {/* Buyer & Date Section */}
        <div className="p-3.5 rounded-xl bg-background border border-border space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-primary" /> Buyer / Trader
            </span>
            <span className="font-bold text-text-primary">{harvest.buyerName || 'Buyer'}</span>
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-2">
            <span className="text-text-secondary flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-accent" /> Harvest Date
            </span>
            <span className="font-bold text-text-primary">{harvest.harvestDate}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
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

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(harvest)}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default HarvestDetailsModal;
