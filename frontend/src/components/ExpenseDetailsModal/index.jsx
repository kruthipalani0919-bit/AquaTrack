import React from 'react';
import { Receipt, Container, Calendar, CreditCard, Edit3, Trash2, Tag, IndianRupee } from 'lucide-react';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * Reusable ExpenseDetailsModal component to view full expense record details.
 */
export const ExpenseDetailsModal = ({
  isOpen,
  onClose,
  expense,
  onEdit,
  onDelete,
}) => {
  if (!expense) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expense.description}
      description="Expense breakdown and payment details"
      size="md"
    >
      <div className="space-y-6">
        {/* Header Category & Tank */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border">
          <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            <Container className="w-4 h-4 text-primary" /> {expense.tankName || 'Tank 1'}
          </span>
          <Badge variant="primary">
            {expense.category}
          </Badge>
        </div>

        {/* Spec Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-lg bg-surface border border-border flex items-center gap-3">
            <IndianRupee className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <span className="text-[10px] text-text-secondary uppercase font-semibold block">Amount</span>
              <span className="text-base font-extrabold text-indigo-700">₹{(parseFloat(expense.amount) || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-surface border border-border flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-teal-600 shrink-0" />
            <div>
              <span className="text-[10px] text-text-secondary uppercase font-semibold block">Payment Mode</span>
              <span className="text-xs font-bold text-text-primary">{expense.paymentMode}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-surface border border-border flex items-center gap-3">
            <Calendar className="w-5 h-5 text-accent shrink-0" />
            <div>
              <span className="text-[10px] text-text-secondary uppercase font-semibold block">Date</span>
              <span className="text-xs font-bold text-text-primary">{expense.date}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-surface border border-border flex items-center gap-3">
            <Tag className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="text-[10px] text-text-secondary uppercase font-semibold block">Category</span>
              <span className="text-xs font-bold text-text-primary">{expense.category}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {expense.notes && (
          <div className="p-3.5 rounded-xl bg-background border border-border space-y-1">
            <span className="text-xs font-bold text-text-primary block">Transaction Notes</span>
            <p className="text-xs text-text-secondary leading-relaxed">{expense.notes}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(expense)}
            icon={<Edit3 className="w-4 h-4" />}
          >
            Edit Record
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(expense)}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExpenseDetailsModal;
