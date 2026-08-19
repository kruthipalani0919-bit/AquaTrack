import React from 'react';
import { X } from 'lucide-react';
import { SearchBar } from '../SearchBar';
import { Button } from '../Button';

/**
 * Reusable SiteFilters component for site search.
 */
export const SiteFilters = ({
  searchQuery = '',
  onSearchChange,
  onReset,
  className = '',
}) => {
  const hasActiveFilters = Boolean(searchQuery);

  return (
    <div className={`flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface border border-border rounded-xl p-4 shadow-xs ${className}`}>
      {/* Search Bar Input */}
      <div className="flex-1 max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          placeholder="Search site name or location..."
        />
      </div>

      {/* Clear / Reset Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          icon={<X className="w-4 h-4 text-danger" />}
          className="text-xs text-danger font-medium hover:bg-danger-light/50"
        >
          Reset Search
        </Button>
      )}
    </div>
  );
};

export default SiteFilters;
