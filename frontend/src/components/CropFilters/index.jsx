import React from 'react';
import { X } from 'lucide-react';
import { SearchBar } from '../SearchBar';
import { Select } from '../Select';
import { Button } from '../Button';
import { CROP_STATUS_OPTIONS } from '../../constants/cropData';
import { useTanks } from '../../context/TankContext';

/**
 * Reusable CropFilters component for search & multi-dropdown filtering.
 */
export const CropFilters = ({
  searchQuery = '',
  onSearchChange,
  statusFilter = '',
  onStatusChange,
  tankFilter = '',
  onTankChange,
  onReset,
  className = '',
}) => {
  const { tanks = [] } = useTanks();

  const hasActiveFilters = Boolean(searchQuery || statusFilter || tankFilter);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...CROP_STATUS_OPTIONS,
  ];

  const tankOptions = [
    { value: '', label: 'All Tanks' },
    ...(tanks || []).map((t) => ({ value: t.id, label: t.name || t.tankName || 'Tank' })),
  ];

  return (
    <div className={`flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface border border-border rounded-xl p-4 shadow-xs ${className}`}>
      {/* Search Bar Input */}
      <div className="flex-1 max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          placeholder="Search batch number, seed variety, tank name, notes..."
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        {/* Status Dropdown */}
        <div className="w-36 sm:w-44">
          <Select
            placeholder=""
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            fullWidth
          />
        </div>

        {/* Tank Dropdown */}
        <div className="w-40 sm:w-48">
          <Select
            placeholder=""
            options={tankOptions}
            value={tankFilter}
            onChange={(e) => onTankChange(e.target.value)}
            fullWidth
          />
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            icon={<X className="w-4 h-4 text-danger" />}
            className="text-xs text-danger font-medium hover:bg-danger-light/50"
          >
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default CropFilters;
