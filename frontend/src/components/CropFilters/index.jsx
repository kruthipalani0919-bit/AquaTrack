import React from 'react';
import { X } from 'lucide-react';
import { SearchBar } from '../SearchBar';
import { Select } from '../Select';
import { Button } from '../Button';
import { useTanks } from '../../context/TankContext';

/**
 * Reusable CropFilters component for search & tank filtering.
 * "All Statuses" filter has been completely removed.
 */
export const CropFilters = ({
  searchQuery = '',
  onSearchChange,
  tankFilter = '',
  onTankChange,
  onReset,
  className = '',
}) => {
  const { tanks = [] } = useTanks();

  const hasActiveFilters = Boolean(searchQuery || tankFilter);

  // Clean tank labels to never expose water source
  const tankOptions = [
    { value: '', label: 'All Tanks' },
    ...(tanks || []).map((t) => {
      const rawName = t.name || t.tankName || 'Tank';
      const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim();
      return { value: t.id, label: cleanName };
    }),
  ];

  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface border border-border rounded-xl p-4 shadow-xs ${className}`}>
      {/* Search Bar Input */}
      <div className="flex-1 max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          placeholder="Search batch, seed variety or tank..."
        />
      </div>

      {/* Filter Dropdown & Reset */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Tank Dropdown */}
        <div className="w-44 sm:w-48">
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
            className="text-xs text-danger font-medium hover:bg-danger-light/50 shrink-0"
            title="Reset Filters"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default CropFilters;
