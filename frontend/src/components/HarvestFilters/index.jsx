import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Select } from '../Select';
import { Button } from '../Button';
import { useTanks } from '../../context/TankContext';

/**
 * Reusable HarvestFilters component for filtering harvest logs strictly by tank.
 * Uses clean tank terminology without "Pond" strings or water source details.
 */
export const HarvestFilters = ({
  tankFilter = '',
  onTankChange,
  onReset,
  className = '',
}) => {
  const { tanks = [] } = useTanks();

  const tankOptions = [
    { value: '', label: 'All Tanks' },
    ...(tanks || []).map((t) => {
      const rawName = t.name || t.tankName || 'Tank';
      const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim();
      return { value: t.id, label: cleanName };
    }),
  ];

  const hasActiveFilters = Boolean(tankFilter);

  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface border border-border rounded-xl p-4 shadow-xs ${className}`}>
      {/* Tank Select Dropdown */}
      <div className="flex flex-wrap items-center gap-3 flex-1">
        <div className="w-48 sm:w-56">
          <Select
            value={tankFilter}
            onChange={(e) => onTankChange(e.target.value)}
            options={tankOptions}
            placeholder=""
            fullWidth
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs text-text-secondary hover:text-primary shrink-0"
          >
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default HarvestFilters;
