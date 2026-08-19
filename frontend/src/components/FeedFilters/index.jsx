import React from 'react';
import { X } from 'lucide-react';
import { SearchBar } from '../SearchBar';
import { Select } from '../Select';
import { Input } from '../Input';
import { Button } from '../Button';
import { FEED_TYPE_OPTIONS } from '../../constants/feedData';
import { useTanks } from '../../context/TankContext';

/**
 * Reusable FeedFilters component for search, feed type, tank, and date filters.
 */
export const FeedFilters = ({
  searchQuery = '',
  onSearchChange,
  typeFilter = '',
  onTypeChange,
  tankFilter = '',
  onTankChange,
  dateFilter = '',
  onDateChange,
  onReset,
  className = '',
}) => {
  const { tanks = [] } = useTanks();

  const hasActiveFilters = Boolean(
    searchQuery || typeFilter || tankFilter || dateFilter
  );

  const typeOptions = [
    { value: '', label: 'All Feed Types' },
    ...FEED_TYPE_OPTIONS,
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
      {/* Top Search Bar */}
      <div className="w-full">
        <SearchBar
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          placeholder="Search feed brand, type, tank name, notes..."
        />
      </div>

      {/* Dropdown Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-1">
        {/* Feed Type */}
        <Select
          placeholder=""
          options={typeOptions}
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          fullWidth
        />

        {/* Tank Select */}
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

export default FeedFilters;
