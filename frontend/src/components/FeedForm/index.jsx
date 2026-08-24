import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UtensilsCrossed, Container, Calendar, IndianRupee, Package } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Button } from '../Button';
import { useTanks } from '../../context/TankContext';

// Zod Validation Schema matching required text inputs
const feedSchema = z.object({
  tankId: z
    .string()
    .min(1, 'Please select a Tank'),
  date: z
    .string()
    .min(1, 'Date is required'),
  feedBrand: z
    .string()
    .min(1, 'Feed Brand is required')
    .trim(),
  feedType: z
    .string()
    .min(1, 'Feed Type is required')
    .trim(),
  quantity: z
    .coerce
    .number({ invalid_type_error: 'Quantity must be a number' })
    .positive('Quantity must be greater than 0'),
  costPerKg: z
    .coerce
    .number({ invalid_type_error: 'Cost per kg must be a number' })
    .positive('Cost per kg must be greater than 0'),
  notes: z
    .string()
    .optional(),
});

/**
 * Reusable FeedForm component with dynamic Tank dropdown from TankContext.
 * Tank display NEVER includes water source (e.g. Borewell).
 */
export const FeedForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { tanks } = useTanks();
  const isEditing = Boolean(initialData?.id);

  // Format Tank label cleanly WITHOUT water source (e.g., A1 or A1 (5 Acres))
  const tankSelectOptions = tanks.map((tank) => {
    const rawName = tank.name || tank.tankName || 'Tank';
    const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim();
    const areaSuffix = tank.area ? ` (${tank.area} Acres)` : '';
    return {
      value: tank.id,
      label: `${cleanName}${areaSuffix}`,
    };
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(feedSchema),
    defaultValues: {
      tankId: '',
      date: new Date().toISOString().split('T')[0],
      feedBrand: '',
      feedType: '',
      quantity: '',
      costPerKg: '',
      notes: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (initialData) {
      reset({
        tankId: initialData.tankId || '',
        date: initialData.date || initialData.feedingDate || '',
        feedBrand: initialData.feedBrand || '',
        feedType: initialData.feedType || '',
        quantity: initialData.quantity || initialData.quantityKg || '',
        costPerKg: initialData.costPerKg || (initialData.feedCost && initialData.quantityKg ? initialData.feedCost / initialData.quantityKg : ''),
        notes: initialData.notes || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    const selectedTankObj = tanks.find((t) => t.id === data.tankId);
    const rawTankName = selectedTankObj ? selectedTankObj.name : 'Selected Tank';
    const cleanTankName = rawTankName.replace(/\s*\([^)]*\)/g, '').trim();

    // Backend Request Model: { tankId, date, feedType, feedBrand, feedSize, quantity, costPerKg, notes }
    const feedPayload = {
      tankId: data.tankId,
      date: data.date,
      feedBrand: data.feedBrand.trim(),
      feedType: data.feedType.trim(),
      feedSize: initialData?.feedSize || '1.2mm',
      quantity: parseFloat(data.quantity),
      costPerKg: parseFloat(data.costPerKg),
      notes: data.notes ? data.notes.trim() : '',
    };

    if (onSubmit) {
      onSubmit({
        ...feedPayload,
        tankName: cleanTankName,
        quantityKg: feedPayload.quantity,
        feedingDate: feedPayload.date,
        feedCost: feedPayload.quantity * feedPayload.costPerKg,
        status: initialData?.status || 'Completed',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
      {/* SECTION 1: BASIC INFORMATION */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary border-b border-border/50 pb-1 flex items-center gap-1.5">
          <Container className="w-3.5 h-3.5 text-primary" /> Basic Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Choose Tank"
            required={true}
            placeholder="Choose tank..."
            options={tankSelectOptions}
            error={errors.tankId?.message}
            {...register('tankId')}
          />

          <Input
            label="Feeding Date"
            type="date"
            required={true}
            icon={<Calendar className="w-4 h-4" />}
            error={errors.date?.message}
            {...register('date')}
          />
        </div>
      </div>

      {/* SECTION 2: FEED INFORMATION */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary border-b border-border/50 pb-1 flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-primary" /> Feed Specifications
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Feed Brand"
            type="text"
            placeholder="Enter feed brand..."
            required={true}
            icon={<Package className="w-4 h-4" />}
            error={errors.feedBrand?.message}
            {...register('feedBrand')}
          />

          <Input
            label="Feed Type"
            type="text"
            placeholder="Enter feed type..."
            required={true}
            icon={<Package className="w-4 h-4" />}
            error={errors.feedType?.message}
            {...register('feedType')}
          />
        </div>
      </div>

      {/* SECTION 3: QUANTITY & COST */}
      <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-3 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <UtensilsCrossed className="w-3.5 h-3.5" /> Quantity & Cost
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Quantity (Kg)"
            type="number"
            step="0.5"
            placeholder="e.g. 45"
            required={true}
            icon={<UtensilsCrossed className="w-4 h-4 text-primary" />}
            error={errors.quantity?.message}
            {...register('quantity')}
          />

          <Input
            label="Cost Per Kg (₹)"
            type="number"
            step="1"
            placeholder="e.g. 70"
            required={true}
            icon={<IndianRupee className="w-4 h-4 text-primary" />}
            error={errors.costPerKg?.message}
            {...register('costPerKg')}
          />
        </div>
      </div>

      {/* SECTION 4: OPTIONAL NOTES */}
      <div>
        <Textarea
          label="Notes (Optional)"
          placeholder="Add any additional notes..."
          rows={2}
          error={errors.notes?.message}
          {...register('notes')}
        />
      </div>

      {/* ACTION BUTTONS */}
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
          disabled={isSubmitting}
          className="font-semibold"
        >
          {isEditing ? (isSubmitting ? 'Updating...' : 'Update Feed Log') : (isSubmitting ? 'Recording...' : 'Record Feed')}
        </Button>
      </div>
    </form>
  );
};

export default FeedForm;
