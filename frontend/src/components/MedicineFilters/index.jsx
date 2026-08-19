import React from 'react';
import { X } from 'lucide-react';
import { SearchBar } from '../SearchBar';
import { Select } from '../Select';
import { Input } from '../Input';
import { Button } from '../Button';
import { MEDICINE_CATEGORY_OPTIONS } from '../../constants/medicineData';
import { useTanks } from '../../context/TankContext';

/**
 * Reusable MedicineFilters component for search, category, tank, and date filters.
 */
export const MedicineFilters = ({
  searchQuery = '',
  onSearchChange,
  categoryFilter = '',
  onCategoryChange,
  tankFilter = '',
  onTankChange,
  dateFilter = '',
  onDateChange,
  onReset,
  className = '',
}) => {
  const { tanks = [] } = useTanks();

  const hasActiveFilters = Boolean(
    searchQuery || categoryFilter || tankFilter || dateFilter
  );

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...MEDICINE_CATEGORY_OPTIONS,
  ];

  // Clean tank names so water source is NEVER exposed
  const tankOptions = [
    { value: '', label: 'All Tanks' },
    ...(tanks || []).map((t) => {
      const rawName = t.name || t.tankName || 'Tank';
      const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim();
      return { value: t.id, label: cleanName };
    }),
  ];

  return (
    <div className={`flex flex-col gap-3 bg-surface border border-border rounded-xl p-4 shadow-xs ${className}`}>
      {/* Search Bar */}
      <div className="w-full">
        <SearchBar
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          placeholder="Search medicine name, tank name, notes..."
        />
      </div>

      {/* Multi-Filter Dropdowns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-1">
        {/* Category */}
        <Select
          placeholder=""
          options={categoryOptions}
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          fullWidth
        />

        {/* Tank */}
        <Select
          placeholder=""
          options={tankOptions}
          value={tankFilter}
          onChange={(e) => onTankChange(e.target.value)}
          fullWidth
        />

        {/* Date Filter & Reset */}
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            placeholder="Select Date"
            className="text-xs"
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              icon={<X className="w-4 h-4 text-danger" />}
              className="text-xs text-danger font-medium hover:bg-danger-light/50 shrink-0"
              title="Reset Filters"
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicineFilters;
