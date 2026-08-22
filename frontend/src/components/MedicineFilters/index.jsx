import React from 'react';
import { X } from 'lucide-react';
import { Select } from '../Select';
import { Input } from '../Input';
import { Button } from '../Button';
import { useTanks } from '../../context/TankContext';

/**
 * Reusable MedicineFilters component displaying ONLY All Tanks dropdown and Date picker.
 * Search box and All Categories filter dropdown have been removed completely.
 */
export const MedicineFilters = ({
  tankFilter = '',
  onTankChange,
  dateFilter = '',
  onDateChange,
  onReset,
  className = '',
}) => {
  const { tanks = [] } = useTanks();

  const hasActiveFilters = Boolean(tankFilter || dateFilter);

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
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface border border-border rounded-xl p-4 shadow-xs ${className}`}>
      {/* Filter Controls: All Tanks & Date */}
      <div className="flex flex-wrap items-center gap-3 flex-1">
        {/* Tank Select */}
        <div className="w-48 sm:w-56">
          <Select
            placeholder=""
            options={tankOptions}
            value={tankFilter}
            onChange={(e) => onTankChange(e.target.value)}
            fullWidth
          />
        </div>

        {/* Date Filter */}
        <div className="w-44 sm:w-48">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            placeholder="Select Date"
            className="text-xs"
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

export default MedicineFilters;
