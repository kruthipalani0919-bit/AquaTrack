import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Select } from '../Select';
import { Button } from '../Button';
import { EXPENSE_CATEGORY_OPTIONS } from '../../constants/expenseData';
import { useTanks } from '../../context/TankContext';

/**
 * Reusable ExpenseFilters component for filtering expenses by category and tank.
 * Search bar has been removed as requested.
 */
export const ExpenseFilters = ({
  categoryFilter,
  onCategoryChange,
  tankFilter,
  onTankChange,
  onReset,
  className = '',
}) => {
  const { tanks = [] } = useTanks();

  const tankOptions = [
    { value: '', label: 'Select Tank' },
    ...(tanks || []).map((t) => {
      const rawName = t.name || t.tankName || 'Tank';
      const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim();
      return { value: t.id, label: cleanName };
    }),
  ];

  const categoryOptions = [
    { value: '', label: 'Select Category' },
    ...EXPENSE_CATEGORY_OPTIONS,
  ];

  const hasActiveFilters = Boolean(categoryFilter || tankFilter);

  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface border border-border rounded-xl p-4 shadow-xs ${className}`}>
      {/* Category and Tank Dropdowns */}
      <div className="flex flex-wrap items-center gap-3 flex-1">
        <div className="w-48 sm:w-56">
          <Select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            options={categoryOptions}
            placeholder=""
            fullWidth
          />
        </div>

        <div className="w-48 sm:w-56">
          <Select
            value={tankFilter}
            onChange={(e) => onTankChange(e.target.value)}
            options={tankOptions}
            placeholder=""
            fullWidth
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs text-text-secondary hover:text-primary shrink-0"
          >
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExpenseFilters;
