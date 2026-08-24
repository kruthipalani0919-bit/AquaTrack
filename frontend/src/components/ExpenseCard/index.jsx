import React from 'react';
import { Receipt, Eye, Edit3, Trash2 } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';

/**
 * Reusable ExpenseCard component matching the visual language, structure, padding,
 * icon container, typography, and button styling of TankCard:
 * - Header: Expense Icon in pastel container, Expense Category (e.g. Seed Cost), Tank Subtitle (e.g. Tank A1) directly below.
 * - Information Area: Clean specification box for Expense Amount (highlighted), Payment Mode, and Date.
 * - Footer Actions: View Details (primary outline button), Edit & Delete icon triggers.
 */
export const ExpenseCard = ({
  expense = {},
  onView,
  onViewDetails,
  onEdit,
  onDelete,
  className = '',
}) => {
  const handleView = onViewDetails || onView;
  const {
    id,
    tankName,
    category,
    description,
    amount,
    paymentMode,
    paymentModeDisplay,
    date,
    notes,
  } = expense || {};

  const displayCategory = category || description || 'Farm Expense';

  // Clean tank name: e.g. "Tank A1" without "Tank: A1" prefix or water source string
  const rawTank = tankName || expense?.tank?.name || expense?.tank?.tankName || 'A1';
  const cleanTank = rawTank.replace(/\s*\([^)]*\)/g, '').trim() || rawTank;
  const tankLabel = cleanTank.toLowerCase().startsWith('tank') ? cleanTank : `Tank ${cleanTank}`;

  const displayPayment = paymentModeDisplay || (paymentMode === 'UPI' ? 'UPI / Net Banking' : paymentMode) || 'Cash';
  const displayDate = date || 'Not specified';
  const numericAmount = parseFloat(amount) || 0;

  return (
    <Card
      hoverEffect={true}
      padding="normal"
      className={`flex flex-col justify-between border-border/80 bg-surface shadow-xs transition-all ${className}`}
    >
      {/* 1. TOP HEADER ROW: Icon, Expense Category & Tank Subtitle */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-xs">
            <Receipt className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-base text-text-primary truncate tracking-tight" title={displayCategory}>
              {displayCategory}
            </h3>
            <p className="text-xs text-text-secondary font-medium truncate mt-0.5" title={tankLabel}>
              {tankLabel}
            </p>
          </div>
        </div>
      </div>

      {/* 2. INFORMATION SPECIFICATION BOX */}
      <div className="py-4 border-b border-border/60">
        <div className="flex flex-col items-start p-3 rounded-lg bg-background/60 border border-border/40 space-y-2">
          <div className="w-full flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">
              Amount
            </span>
            <span className="text-sm font-black text-text-primary tracking-tight">
              ₹{numericAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="w-full flex items-center justify-between pt-1 border-t border-border/40">
            <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">
              Payment Mode
            </span>
            <span className="text-xs font-bold text-primary truncate">
              {displayPayment}
            </span>
          </div>

          <div className="w-full flex items-center justify-between pt-1 border-t border-border/40">
            <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">
              Date
            </span>
            <span className="text-xs font-semibold text-text-secondary truncate">
              {displayDate}
            </span>
          </div>
        </div>
      </div>

      {/* 3. CARD ACTIONS FOOTER */}
      <div className="pt-3 flex items-center justify-between gap-2 mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleView && handleView(expense)}
          icon={<Eye className="w-4 h-4 text-primary" />}
          className="text-xs font-medium"
        >
          View Details
        </Button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit && onEdit(expense)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-light/50 transition-colors cursor-pointer"
            title="Edit Expense"
            aria-label={`Edit ${displayCategory}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete && onDelete(expense)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-light/50 transition-colors cursor-pointer"
            title="Delete Expense"
            aria-label={`Delete ${displayCategory}`}
          >
            <Trash2 className="w-4 h-4 text-danger/80" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ExpenseCard;
