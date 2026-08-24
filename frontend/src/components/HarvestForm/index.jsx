import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wheat, Calendar, Weight, IndianRupee, User, Container, AlertCircle } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Button } from '../Button';
import { useTanks } from '../../context/TankContext';

// Zod Validation Schema matching backend contract (POST /api/harvests)
const harvestSchema = z.object({
  tankId: z
    .string()
    .min(1, 'Please select a Tank'),
  harvestDate: z
    .string()
    .min(1, 'Harvest Date is required'),
  shrimpCount: z
    .coerce
    .number({ invalid_type_error: 'Shrimp Count must be a number' })
    .positive('Shrimp Count must be greater than 0'),
  sellingPrice: z
    .coerce
    .number({ invalid_type_error: 'Selling Price must be a number' })
    .positive('Selling Price must be greater than 0'),
  buyerName: z
    .string()
    .min(1, 'Buyer Name is required')
    .trim(),
  harvestExpense: z
    .coerce
    .number({ invalid_type_error: 'Harvest Expense must be a number' })
    .min(0, 'Harvest Expense cannot be negative'),
  notes: z
    .string()
    .optional(),
});

/**
 * Reusable HarvestForm component for both Registering New Harvest and Editing Existing Harvest.
 */
export const HarvestForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  errorMessage = '',
}) => {
  const { tanks = [] } = useTanks();
  const isEditing = Boolean(initialData?.id);

  // Clean tank labels without water source string
  const tankSelectOptions = useMemo(() => {
    const options = tanks.map((tank) => {
      const rawName = tank.name || tank.tankName || 'Tank';
      const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim();
      const areaSuffix = tank.area ? ` (${tank.area} Acres)` : '';
      return {
        value: tank.id,
        label: `${cleanName}${areaSuffix}`,
      };
    });

    // When editing an existing harvest, ensure assigned tank is present in options list
    if (isEditing && initialData) {
      const currentTankId = initialData.tankId || initialData.tank?.id || initialData.crop?.tankId || initialData.crop?.tank?.id;
      if (currentTankId && !options.some((opt) => opt.value === currentTankId)) {
        const rawName = initialData.tankName || initialData.crop?.tank?.tankName || initialData.tank?.name || 'Assigned Tank';
        const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim();
        options.unshift({
          value: currentTankId,
          label: cleanName,
        });
      }
    }

    return options;
  }, [tanks, isEditing, initialData]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(harvestSchema),
    defaultValues: {
      tankId: '',
      harvestDate: new Date().toISOString().split('T')[0],
      shrimpCount: '',
      sellingPrice: '',
      buyerName: '',
      harvestExpense: '0',
      notes: '',
    },
    mode: 'onTouched',
  });

  // Watch shrimpCount for auto ABW calculation
  const shrimpCountVal = watch('shrimpCount');
  const numericShrimpCount = parseFloat(shrimpCountVal) || 0;
  const calculatedAbw = numericShrimpCount > 0 ? (1000 / numericShrimpCount).toFixed(2) : '';

  useEffect(() => {
    if (initialData) {
      const resolvedTankId = initialData.tankId || initialData.tank?.id || initialData.crop?.tankId || initialData.crop?.tank?.id || '';
      reset({
        tankId: resolvedTankId,
        harvestDate: initialData.harvestDate
          ? new Date(initialData.harvestDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        shrimpCount: initialData.shrimpCount !== undefined && initialData.shrimpCount !== null ? initialData.shrimpCount : (initialData.production || ''),
        sellingPrice: initialData.sellingPrice !== undefined && initialData.sellingPrice !== null ? initialData.sellingPrice : '',
        buyerName: initialData.buyerName || '',
        harvestExpense: initialData.harvestExpense !== undefined && initialData.harvestExpense !== null ? initialData.harvestExpense : '0',
        notes: initialData.notes || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    const selectedTankObj = tanks.find((t) => t.id === data.tankId);
    const rawTankName = selectedTankObj
      ? selectedTankObj.name || selectedTankObj.tankName
      : (initialData?.tankName || initialData?.crop?.tank?.tankName || 'Selected Tank');
    const cleanTankName = rawTankName.replace(/\s*\([^)]*\)/g, '').trim();

    const numericCount = parseFloat(data.shrimpCount);
    const autoAbw = numericCount > 0 ? parseFloat((1000 / numericCount).toFixed(2)) : 0;

    const harvestPayload = {
      tankId: data.tankId,
      harvestDate: data.harvestDate,
      shrimpCount: numericCount,
      production: numericCount,
      averageWeight: autoAbw,
      survivalRate: 85,
      sellingPrice: parseFloat(data.sellingPrice),
      buyerName: data.buyerName.trim(),
      transportationCost: null,
      harvestExpense: parseFloat(data.harvestExpense || 0),
      notes: data.notes ? data.notes.trim() : '',
    };

    if (onSubmit) {
      onSubmit({
        ...harvestPayload,
        tankName: cleanTankName,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
      {/* Error Message Banner */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-danger-light/50 border border-danger/30 text-danger text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* BASIC INFORMATION SECTION */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary border-b border-border/50 pb-1 flex items-center gap-1.5">
          <Container className="w-3.5 h-3.5 text-primary" /> Basic Information
        </h4>

        {/* Row 1: Tank & Harvest Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Tank"
            required={true}
            placeholder="Choose tank..."
            options={tankSelectOptions}
            error={errors.tankId?.message}
            {...register('tankId')}
          />

          <Input
            label="Harvest Date"
            type="date"
            required={true}
            icon={<Calendar className="w-4 h-4" />}
            error={errors.harvestDate?.message}
            {...register('harvestDate')}
          />
        </div>

        {/* Buyer Name */}
        <Input
          label="Buyer Name"
          type="text"
          placeholder="Enter buyer name..."
          required={true}
          icon={<User className="w-4 h-4" />}
          error={errors.buyerName?.message}
          {...register('buyerName')}
        />

        {/* Selling Price (₹/kg) */}
        <Input
          label="Selling Price (₹/kg)"
          type="number"
          step="1"
          placeholder="Enter price per kg..."
          required={true}
          icon={<IndianRupee className="w-4 h-4" />}
          error={errors.sellingPrice?.message}
          {...register('sellingPrice')}
        />
      </div>

      {/* HARVEST DETAILS SECTION */}
      <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-3 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Wheat className="w-3.5 h-3.5 text-primary" /> Harvest Details
        </h4>

        {/* Shrimp Count */}
        <Input
          label="Shrimp Count"
          type="number"
          step="1"
          placeholder="Enter number of shrimp"
          required={true}
          icon={<Wheat className="w-4 h-4 text-primary" />}
          error={errors.shrimpCount?.message}
          {...register('shrimpCount')}
        />

        {/* Average Weight (ABW) - Read-only / Auto-calculated */}
        <Input
          label="Average Weight (ABW in grams)"
          type="text"
          value={calculatedAbw ? `${calculatedAbw} g` : ''}
          placeholder="Auto-calculated"
          disabled={true}
          icon={<Weight className="w-4 h-4 text-primary" />}
          className="bg-surface cursor-not-allowed opacity-90 font-medium"
        />

        {/* Harvest Expense (₹) */}
        <Input
          label="Harvest Expense (₹)"
          type="number"
          step="1"
          placeholder="0"
          required={true}
          icon={<IndianRupee className="w-4 h-4 text-primary" />}
          error={errors.harvestExpense?.message}
          {...register('harvestExpense')}
        />
      </div>

      {/* NOTES (OPTIONAL) */}
      <div>
        <Textarea
          label="Notes (Optional)"
          placeholder="Add buyer details, harvest quality, or remarks..."
          rows={2}
          error={errors.notes?.message}
          {...register('notes')}
        />
      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/80">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          className="font-semibold"
        >
          {isEditing ? 'Update Harvest Record' : 'Register Harvest'}
        </Button>
      </div>
    </form>
  );
};

export default HarvestForm;
