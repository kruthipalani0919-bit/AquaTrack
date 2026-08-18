import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sprout, Calendar, Container, Tag } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Button } from '../Button';
import { useTanks } from '../../context/TankContext';

// Zod Validation Schema strictly matching required form fields
const cropSchema = z.object({
  tankId: z
    .string()
    .min(1, 'Please select a Tank'),
  stockingDate: z
    .string()
    .min(1, 'Stocking Date is required'),
  seedVariety: z
    .string()
    .min(1, 'Seed Variety is required')
    .trim(),
  batchNumber: z
    .string()
    .min(1, 'Batch Number is required')
    .trim(),
  notes: z
    .string()
    .optional(),
});

/**
 * Reusable CropForm component for Registering and Editing crops.
 * Contains exact user-requested layout:
 * - Row 1 (side-by-side): Tank & Stocking Date
 * - Highlighted "Crop Specifications" section: Seed Variety (full width) stacked above Batch Number (full width)
 * - Row 3: Notes (Optional)
 * Computes internal fallback defaults for plCount, expectedHarvestDate, expectedProduction, and expectedSellingPrice
 * to preserve 100% backend API contract compatibility.
 */
export const CropForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { tanks } = useTanks();
  const isEditing = Boolean(initialData?.id);

  const tankSelectOptions = tanks.map((tank) => ({
    value: tank.id,
    label: `${tank.name} (${tank.area} Acres)`,
  }));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      tankId: '',
      stockingDate: new Date().toISOString().split('T')[0],
      seedVariety: '',
      batchNumber: '',
      notes: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (initialData) {
      reset({
        tankId: initialData.tankId || '',
        stockingDate: initialData.stockingDate || new Date().toISOString().split('T')[0],
        seedVariety: initialData.seedVariety || '',
        batchNumber: initialData.batchNumber || initialData.cropName || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    const selectedTankObj = tanks.find((t) => t.id === data.tankId);

    // Compute internal fallback defaults to ensure backend API request compliance
    const stockingTime = data.stockingDate ? new Date(data.stockingDate).getTime() : Date.now();
    const computedHarvestDate = new Date(stockingTime + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const parsedPl = initialData?.plCount || 100000;
    const computedProduction = initialData?.expectedProduction || Math.round(parsedPl * 0.015);
    const computedSellingPrice = initialData?.expectedSellingPrice || 350;

    // Full Backend Payload
    const cropPayload = {
      tankId: data.tankId,
      cropName: data.batchNumber.trim(),
      seedVariety: data.seedVariety.trim(),
      plCount: parsedPl,
      stockingDate: data.stockingDate,
      expectedHarvestDate: initialData?.expectedHarvestDate || computedHarvestDate,
      cropDuration: 120,
      expectedProduction: computedProduction,
      expectedSellingPrice: computedSellingPrice,
      notes: data.notes ? data.notes.trim() : '',
    };

    if (onSubmit) {
      onSubmit({
        ...cropPayload,
        batchNumber: data.batchNumber.trim(),
        tankName: selectedTankObj ? selectedTankObj.name : 'Selected Tank',
        expectedProductionKg: cropPayload.expectedProduction,
        expectedSellingPricePerKg: cropPayload.expectedSellingPrice,
        status: initialData?.status || 'Active',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
      {/* 1. TANK & 2. STOCKING DATE ROW (Side-by-Side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Tank"
          required={true}
          placeholder="Select tank..."
          options={tankSelectOptions}
          error={errors.tankId?.message}
          icon={<Container className="w-4 h-4" />}
          {...register('tankId')}
        />

        <Input
          label="Stocking Date"
          type="date"
          required={true}
          icon={<Calendar className="w-4 h-4" />}
          error={errors.stockingDate?.message}
          {...register('stockingDate')}
        />
      </div>

      {/* HIGHLIGHTED SECTION: CROP SPECIFICATIONS */}
      <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-3 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary/20 pb-1.5">
          <Sprout className="w-3.5 h-3.5" /> Crop Specifications
        </h4>
        <div className="flex flex-col gap-3">
          {/* 3. SEED VARIETY (Full Width Row) */}
          <Input
            label="Seed Variety"
            type="text"
            placeholder="Enter seed variety..."
            required={true}
            icon={<Sprout className="w-4 h-4 text-primary" />}
            error={errors.seedVariety?.message}
            {...register('seedVariety')}
          />

          {/* 4. BATCH NUMBER (Full Width Row) */}
          <Input
            label="Batch Number"
            type="text"
            placeholder="Enter batch number..."
            required={true}
            icon={<Tag className="w-4 h-4 text-primary" />}
            error={errors.batchNumber?.message}
            {...register('batchNumber')}
          />
        </div>
      </div>

      {/* 5. NOTES (OPTIONAL) */}
      <div>
        <Textarea
          label="Notes (Optional)"
          placeholder="Add additional notes..."
          rows={3}
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
          className="font-semibold"
        >
          {isEditing ? 'Update Crop' : 'Register Crop'}
        </Button>
      </div>
    </form>
  );
};

export default CropForm;
