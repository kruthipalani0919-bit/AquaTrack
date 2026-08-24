import React from 'react';
import { Container, Calendar, CreditCard, Edit3, Trash2, Tag, IndianRupee, FileText, Receipt } from 'lucide-react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { formatPaymentModeDisplay } from '../../constants/expenseData';

/**
 * Redesigned ExpenseDetailsModal component featuring clean visual sectioning:
 * SECTION: 🧾 EXPENSE DETAILS (Tank, Expense Category, Amount, Payment Mode, Date)
 * Modal title: <Expense Category>
 * Subtitle: "Expense breakdown and payment details"
 */
export const ExpenseDetailsModal = ({
  isOpen,
  onClose,
  expense,
  onEdit,
  onDelete,
}) => {
  if (!expense) return null;

  const displayCategory = expense.category || expense.description || 'Expense Details';
  const rawTank = expense.tankName || expense.tank?.name || expense.tank?.tankName || 'Not assigned';
  const displayTank = rawTank.replace(/\s*\([^)]*\)/g, '').trim() || rawTank;

  const numericAmount = parseFloat(expense.amount) || 0;
  const formattedDate = expense.date
    ? new Date(expense.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not specified';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={displayCategory}
      description="Expense breakdown and payment details"
      size="md"
    >
      <div className="space-y-5">
        {/* SECTION — EXPENSE DETAILS */}
        <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-3 shadow-2xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary/20 pb-2">
            <Receipt className="w-4 h-4 text-primary" /> Expense Details
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
                <Tag className="w-3 h-3 text-primary" /> Expense Category
              </span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {displayCategory}
              </span>
            </div>

            <div className="bg-surface p-3 rounded-lg border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-primary" /> Payment Mode
              </span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {formatPaymentModeDisplay(expense.paymentMode)}
              </span>
            </div>

            <div className="bg-surface p-3 rounded-lg border border-border/50">
              <span className="text-[10px] text-text-secondary uppercase font-semibold block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-primary" /> Date
              </span>
              <span className="text-sm font-bold text-text-primary mt-0.5 block truncate">
                {formattedDate}
              </span>
            </div>

            <div className="bg-surface p-3 rounded-lg border border-primary/30 bg-primary-light/20 sm:col-span-2">
              <span className="text-[10px] text-primary uppercase font-bold block flex items-center gap-1">
                <IndianRupee className="w-3 h-3 text-primary" /> Amount
              </span>
              <span className="text-base font-extrabold text-primary mt-0.5 block truncate">
                ₹{numericAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Notes (Only rendered if notes exist) */}
        {expense.notes && (
          <div className="p-3.5 rounded-xl bg-background border border-border/60 text-xs shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1 mb-1">
              <FileText className="w-3.5 h-3.5 text-primary" /> Notes
            </span>
            <p className="text-text-secondary leading-relaxed">{expense.notes}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(expense)}
            icon={<Edit3 className="w-4 h-4" />}
            className="font-semibold"
          >
            Edit Record
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(expense)}
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

export default ExpenseDetailsModal;
