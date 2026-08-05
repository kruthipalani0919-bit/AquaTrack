import React from 'react';
import { RotateCcw } from 'lucide-react';
import { SearchBar } from '../SearchBar';
import { Select } from '../Select';
import { Button } from '../Button';
import { EXPENSE_CATEGORY_OPTIONS } from '../../constants/expenseData';
import { useTanks } from '../../context/TankContext';

/**
 * Reusable ExpenseFilters component for filtering expenses by search query, category, and tank.
 */
export const ExpenseFilters = ({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  tankFilter,
  onTankChange,
  onReset,
}) => {
  const { tanks } = useTanks();

  const tankOptions = [
    { value: '', label: 'All Tanks / Ponds' },
    ...tanks.map((t) => ({ value: t.id, label: t.name })),
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...EXPENSE_CATEGORY_OPTIONS,
  ];

  const hasActiveFilters = Boolean(searchQuery || categoryFilter || tankFilter);

  return (
    <div className="bg-surface border border-border rounded-xl p-4 shadow-xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Bar */}
        <div className="lg:col-span-2">
          <SearchBar
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange('')}
            placeholder="Search by description or notes..."
          />
        </div>

        {/* Category Filter */}
        <Select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          options={categoryOptions}
        />

        {/* Tank Filter */}
        <Select
          value={tankFilter}
          onChange={(e) => onTankChange(e.target.value)}
          options={tankOptions}
        />
      </div>

      {/* Reset Trigger */}
      {hasActiveFilters && (
        <div className="flex justify-end pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs text-text-secondary hover:text-primary"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExpenseFilters;
