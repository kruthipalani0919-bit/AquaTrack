import React from 'react';
import { RotateCcw } from 'lucide-react';
import { SearchBar } from '../SearchBar';
import { Select } from '../Select';
import { Button } from '../Button';
import { useTanks } from '../../context/TankContext';

/**
 * Reusable HarvestFilters component for filtering harvest logs by search query and tank.
 */
export const HarvestFilters = ({
  searchQuery,
  onSearchChange,
  tankFilter,
  onTankChange,
  onReset,
}) => {
  const { tanks } = useTanks();

  const tankOptions = [
    { value: '', label: 'All Tanks / Ponds' },
    ...tanks.map((t) => ({ value: t.id, label: t.name })),
  ];

  const hasActiveFilters = Boolean(searchQuery || tankFilter);

  return (
    <div className="bg-surface border border-border rounded-xl p-4 shadow-xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Bar */}
        <div className="sm:col-span-2">
          <SearchBar
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange('')}
            placeholder="Search by buyer name or tank..."
          />
        </div>

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

export default HarvestFilters;
