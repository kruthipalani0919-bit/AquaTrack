import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wheat, Calendar, Weight, IndianRupee, User, Container, ShieldAlert } from 'lucide-react';

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
 * Reusable HarvestForm component with dynamic Tank dropdown from TankContext.
 * Supports Register Harvest and Edit Harvest operations.
 * Displays error messages cleanly in a highlighted banner if registration/edit fails.
 */
export const HarvestForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { tanks = [] } = useTanks();
  const isEditing = Boolean(initialData?.id);
  const [formError, setFormError] = useState('');

  // Clean tank labels without water source string
  const tankSelectOptions = tanks.map((tank) => {
    const rawName = tank.name || tank.tankName || 'Tank';
    const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim();
    const areaSuffix = tank.area ? ` (${tank.area} Acres)` : '';
    return {
      value: String(tank.id),
      label: `${cleanName}${areaSuffix}`,
    };
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(harvestSchema),
    defaultValues: {
      tankId: tankSelectOptions.length > 0 ? tankSelectOptions[0].value : '',
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
      reset({
        tankId: initialData.tankId ? String(initialData.tankId) : (tankSelectOptions[0]?.value || ''),
        harvestDate: initialData.harvestDate ? new Date(initialData.harvestDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        shrimpCount: initialData.shrimpCount || initialData.production || '',
        sellingPrice: initialData.sellingPrice || '',
        buyerName: initialData.buyerName || '',
        harvestExpense: initialData.harvestExpense !== undefined && initialData.harvestExpense !== null ? String(initialData.harvestExpense) : '0',
        notes: initialData.notes || '',
      });
    } else {
      reset({
        tankId: tankSelectOptions[0]?.value || '',
        harvestDate: new Date().toISOString().split('T')[0],
        shrimpCount: '',
        sellingPrice: '',
        buyerName: '',
        harvestExpense: '0',
        notes: '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data) => {
    setFormError('');

    const selectedTankObj = tanks.find((t) => String(t.id) === String(data.tankId));
    const rawTankName = selectedTankObj ? (selectedTankObj.name || selectedTankObj.tankName) : 'Selected Tank';
    const cleanTankName = rawTankName.replace(/\s*\([^)]*\)/g, '').trim();

    const numericCount = parseFloat(data.shrimpCount);
    const autoAbw = numericCount > 0 ? parseFloat((1000 / numericCount).toFixed(2)) : 0;

    const harvestPayload = {
      tankId: String(data.tankId),
      harvestDate: data.harvestDate,
      shrimpCount: numericCount,
      production: numericCount,
      averageWeight: autoAbw,
      survivalRate: 85,
      sellingPrice: parseFloat(data.sellingPrice),
      buyerName: String(data.buyerName).trim(),
      transportationCost: null,
      harvestExpense: parseFloat(data.harvestExpense || 0),
      notes: data.notes ? String(data.notes).trim() : '',
      tankName: cleanTankName,
    };

    try {
      if (onSubmit) {
        await onSubmit(harvestPayload);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save harvest record');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
      {formError && (
        <div className="p-3.5 rounded-xl bg-danger-light/30 border border-danger/30 flex items-center gap-2.5 text-danger text-xs font-medium">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
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
            disabled={isSubmitting}
            {...register('tankId')}
          />

          <Input
            label="Harvest Date"
            type="date"
            required={true}
            icon={<Calendar className="w-4 h-4 text-primary" />}
            error={errors.harvestDate?.message}
            disabled={isSubmitting}
            {...register('harvestDate')}
          />
        </div>

        {/* Buyer Name */}
        <Input
          label="Buyer Name"
          type="text"
          placeholder="Enter buyer name..."
          required={true}
          icon={<User className="w-4 h-4 text-primary" />}
          error={errors.buyerName?.message}
          disabled={isSubmitting}
          {...register('buyerName')}
        />

        {/* Selling Price (₹/kg) */}
        <Input
          label="Selling Price (₹/kg)"
          type="number"
          step="1"
          placeholder="Enter price per kg..."
          required={true}
          icon={<IndianRupee className="w-4 h-4 text-primary" />}
          error={errors.sellingPrice?.message}
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
