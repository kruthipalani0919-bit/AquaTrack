import React from 'react';
import { X } from 'lucide-react';
import { SearchBar } from '../SearchBar';
import { Select } from '../Select';
import { Button } from '../Button';

/**
 * Reusable SiteFilters component for search & district/state filtering.
 */
export const SiteFilters = ({
  searchQuery = '',
  onSearchChange,
  districtFilter = '',
  onDistrictChange,
  districtOptions = [],
  onReset,
  className = '',
}) => {
  const hasActiveFilters = Boolean(searchQuery || districtFilter);

  const formattedDistrictOptions = [
    { value: '', label: 'All Districts' },
    ...districtOptions.map((d) => ({ value: d, label: d })),
  ];

  return (
    <div className={`flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface border border-border rounded-xl p-4 shadow-xs ${className}`}>
      {/* Search Bar Input */}
      <div className="flex-1 max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          placeholder="Search site name, location, district..."
        />
      </div>

      {/* Filter Dropdowns & Reset */}
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        {districtOptions.length > 0 && (
          <div className="w-40 sm:w-48">
            <Select
              placeholder=""
              options={formattedDistrictOptions}
              value={districtFilter}
              onChange={(e) => onDistrictChange(e.target.value)}
              fullWidth
            />
          </div>
        )}

        {/* Clear / Reset Filters Button */}
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

export default SiteFilters;
