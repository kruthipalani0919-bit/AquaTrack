import React from 'react';
import { X } from 'lucide-react';
import { SearchBar } from '../SearchBar';
import { Select } from '../Select';
import { Input } from '../Input';
import { Button } from '../Button';
import { WATER_STATUS_OPTIONS } from '../../constants/waterQualityData';
import { useTanks } from '../../context/TankContext';

/**
 * Reusable WaterFilters component for search, tank, date, and status filters.
 */
export const WaterFilters = ({
  searchQuery = '',
  onSearchChange,
  tankFilter = '',
  onTankChange,
  dateFilter = '',
  onDateChange,
  statusFilter = '',
  onStatusChange,
  onReset,
  className = '',
}) => {
  const { tanks } = useTanks();

  const hasActiveFilters = Boolean(
    searchQuery || tankFilter || dateFilter || statusFilter
  );

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...WATER_STATUS_OPTIONS,
  ];

  const tankOptions = [
    { value: '', label: 'All Ponds / Tanks' },
    ...tanks.map((t) => ({ value: t.id, label: t.name })),
  ];

  return (
    <div className={`flex flex-col gap-3 bg-surface border border-border rounded-xl p-4 shadow-xs ${className}`}>
      {/* Top Search Bar */}
      <div className="w-full">
        <SearchBar
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          placeholder="Search tank name, notes, or test parameters..."
        />
      </div>

      {/* Dropdown Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-1">
        {/* Tank Select */}
        <Select
          placeholder=""
          options={tankOptions}
          value={tankFilter}
          onChange={(e) => onTankChange(e.target.value)}
          fullWidth
        />

        {/* Status Select */}
        <Select
          placeholder=""
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
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

export default WaterFilters;
