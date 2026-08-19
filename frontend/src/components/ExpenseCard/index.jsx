import React from 'react';
import { Receipt, Container, Calendar, CreditCard, Eye, Edit3, Trash2 } from 'lucide-react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';

/**
 * Reusable ExpenseCard component displaying expense details, category badge, amount, and actions.
 */
export const ExpenseCard = ({
  expense = {},
  onView,
  onEdit,
  onDelete,
  className = '',
}) => {
  const {
    id,
    tankName,
    category,
    description,
    amount,
    paymentMode,
    date,
    notes,
  } = expense;

  const displayDescription = description || category || 'Farm Expense';
  const displayCategory = category || 'General';

  // Format tank name to NEVER expose water source
  const rawTank = tankName || expense?.tank?.name || expense?.tank?.tankName || 'Tank';
  const displayTank = rawTank.replace(/\s*\([^)]*\)/g, '').trim() || rawTank;

  const displayPayment = paymentMode || 'Cash';
  const displayDate = date || 'Today';
  const numericAmount = parseFloat(amount) || 0;

  return (
    <Card
      hoverEffect={true}
      padding="normal"
      className={`flex flex-col justify-between border-border/80 bg-surface shadow-xs transition-all ${className}`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
            <Receipt className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-text-primary truncate tracking-tight" title={displayDescription}>
              {displayDescription}
            </h3>
            <span className="text-[11px] text-text-secondary flex items-center gap-1">
              <Container className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">{displayTank}</span>
            </span>
          </div>
        </div>

        <Badge variant="primary" size="sm" className="shrink-0 bg-indigo-50 text-indigo-700 border-indigo-200">
          {displayCategory}
        </Badge>
      </div>

      {/* Amount & Details Section */}
      <div className="py-3 border-b border-border/60 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary font-medium">Expense Amount</span>
          <span className="text-base sm:text-lg font-extrabold text-indigo-700">
            ₹{numericAmount.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary pt-1">
          <div className="flex items-center gap-1.5 truncate">
            <CreditCard className="w-3.5 h-3.5 text-text-secondary shrink-0" />
            <span className="truncate">{displayPayment}</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <Calendar className="w-3.5 h-3.5 text-text-secondary shrink-0" />
            <span>{displayDate}</span>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="pt-3 flex items-center justify-between gap-2 mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView && onView(expense)}
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
            aria-label={`Edit ${displayDescription}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete && onDelete(expense)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger-light/50 transition-colors cursor-pointer"
            title="Delete Expense"
            aria-label={`Delete ${displayDescription}`}
          >
            <Trash2 className="w-4 h-4 text-danger/80" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ExpenseCard;
