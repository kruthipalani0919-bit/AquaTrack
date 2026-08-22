import React from 'react';
import { X } from 'lucide-react';
import { SearchBar } from '../SearchBar';
import { Select } from '../Select';
import { Button } from '../Button';

/**
 * Reusable TankFilters component for search & site dropdown filtering.
 */
export const TankFilters = ({
  searchQuery = '',
  onSearchChange,
  siteFilter = '',
  onSiteChange,
  sites = [],
  onReset,
  className = '',
}) => {
  const hasActiveFilters = Boolean(searchQuery || siteFilter);

  const siteOptions = [
    { value: '', label: 'All Sites' },
    ...sites.map((s) => ({ value: s.id, label: s.siteName })),
  ];

  return (
    <div className={`flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface border border-border rounded-xl p-4 shadow-xs ${className}`}>
      {/* Search Bar Input */}
      <div className="flex-1 max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          placeholder="Search tank name or remarks..."
        />
      </div>

      {/* Filter Dropdowns & Reset */}
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        {/* Site Dropdown */}
        {sites.length > 0 && (
          <div className="w-40 sm:w-48">
            <Select
              placeholder=""
              options={siteOptions}
              value={siteFilter}
              onChange={(e) => onSiteChange(e.target.value)}
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

export default TankFilters;
