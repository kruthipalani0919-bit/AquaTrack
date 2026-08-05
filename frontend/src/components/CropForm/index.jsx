import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sprout, Calendar, IndianRupee, Weight, Sparkles } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Button } from '../Button';

import { SEED_VARIETY_OPTIONS } from '../../constants/cropData';
import { useTanks } from '../../context/TankContext';

// Zod Validation Schema matching backend contract (POST /api/crops)
const cropSchema = z.object({
  tankId: z
    .string()
    .min(1, 'Please select a Tank / Pond'),
  cropName: z
    .string()
    .min(1, 'Crop Name is required')
    .trim(),
  seedVariety: z
    .string()
    .min(1, 'Please select a Seed Variety'),
  plCount: z
    .coerce
    .number({ invalid_type_error: 'PL Count must be a number' })
    .positive('PL Count must be greater than 0'),
  stockingDate: z
    .string()
    .min(1, 'Stocking Date is required'),
  expectedHarvestDate: z
    .string()
    .min(1, 'Expected Harvest Date is required'),
  expectedProduction: z
    .coerce
    .number({ invalid_type_error: 'Expected Production must be a number' })
    .positive('Expected Production must be greater than 0'),
  expectedSellingPrice: z
    .coerce
    .number({ invalid_type_error: 'Selling Price must be a number' })
    .positive('Selling Price must be greater than 0'),
  notes: z
    .string()
    .optional(),
}).refine((data) => {
  if (data.stockingDate && data.expectedHarvestDate) {
    return new Date(data.expectedHarvestDate) > new Date(data.stockingDate);
  }
  return true;
}, {
  message: 'Expected Harvest Date must be after Stocking Date',
  path: ['expectedHarvestDate'],
});

/**
 * Reusable CropForm component for Registering and Editing crops.
 * Contains ONLY backend-supported fields: tankId, cropName, seedVariety, plCount, stockingDate,
 * expectedHarvestDate, cropDuration, expectedProduction, expectedSellingPrice, notes.
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
    label: `${tank.name} (${tank.area} Acres - ${tank.waterSource})`,
  }));

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      tankId: '',
      cropName: '',
      seedVariety: '',
      plCount: '',
      stockingDate: new Date().toISOString().split('T')[0],
      expectedHarvestDate: '',
      expectedProduction: '',
      expectedSellingPrice: '',
      notes: '',
    },
    mode: 'onTouched',
  });

  // Watch dates for automatic duration calculation
  const stockingDate = useWatch({ control, name: 'stockingDate' });
  const expectedHarvestDate = useWatch({ control, name: 'expectedHarvestDate' });

  // Calculate duration in days
  const calculatedDurationDays = React.useMemo(() => {
    if (stockingDate && expectedHarvestDate) {
      const start = new Date(stockingDate);
      const end = new Date(expectedHarvestDate);
      const diffTime = end - start;
      if (diffTime > 0) {
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }
    }
    return 0;
  }, [stockingDate, expectedHarvestDate]);

  useEffect(() => {
    if (initialData) {
      reset({
        tankId: initialData.tankId || '',
        cropName: initialData.cropName || '',
        seedVariety: initialData.seedVariety || '',
        plCount: initialData.plCount || '',
        stockingDate: initialData.stockingDate || '',
        expectedHarvestDate: initialData.expectedHarvestDate || '',
        expectedProduction: initialData.expectedProduction || initialData.expectedProductionKg || '',
        expectedSellingPrice: initialData.expectedSellingPrice || initialData.expectedSellingPricePerKg || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    const selectedTankObj = tanks.find((t) => t.id === data.tankId);

    // Backend Request Model: { tankId, cropName, seedVariety, plCount, stockingDate, expectedHarvestDate, cropDuration, expectedProduction, expectedSellingPrice, notes }
    const cropPayload = {
      tankId: data.tankId,
      cropName: data.cropName.trim(),
      seedVariety: data.seedVariety,
      plCount: parseFloat(data.plCount),
      stockingDate: data.stockingDate,
      expectedHarvestDate: data.expectedHarvestDate,
      cropDuration: calculatedDurationDays,
      expectedProduction: parseFloat(data.expectedProduction),
      expectedSellingPrice: parseFloat(data.expectedSellingPrice),
      notes: data.notes ? data.notes.trim() : '',
    };

    console.log('Backend Crop Payload:', cropPayload);

    if (onSubmit) {
      onSubmit({
        ...cropPayload,
        tankName: selectedTankObj ? selectedTankObj.name : 'Selected Pond',
        expectedProductionKg: cropPayload.expectedProduction,
        expectedSellingPricePerKg: cropPayload.expectedSellingPrice,
        status: initialData?.status || 'Active',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4" noValidate>
      {/* Tank Select & Crop Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Select Pond / Tank"
          required={true}
          placeholder="Choose pond..."
          options={tankSelectOptions}
          error={errors.tankId?.message}
          {...register('tankId')}
        />

        <Input
          label="Crop Name / Batch Title"
          type="text"
          placeholder="e.g. Vannamei Batch 2026-A"
          required={true}
          icon={<Sprout className="w-4 h-4" />}
          error={errors.cropName?.message}
          {...register('cropName')}
        />
      </div>

      {/* Seed Variety & PL Count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Seed Variety / Species"
          required={true}
          placeholder="Select species..."
          options={SEED_VARIETY_OPTIONS}
          error={errors.seedVariety?.message}
          {...register('seedVariety')}
        />

        <Input
          label="Post-Larvae (PL) Count"
          type="number"
          placeholder="e.g. 150000"
          required={true}
          icon={<Sparkles className="w-4 h-4" />}
          error={errors.plCount?.message}
          {...register('plCount')}
        />
      </div>

      {/* Dates & Auto-Calculated Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Stocking Date"
          type="date"
          required={true}
          icon={<Calendar className="w-4 h-4" />}
          error={errors.stockingDate?.message}
          {...register('stockingDate')}
        />

        <div className="flex flex-col gap-1">
          <Input
            label="Expected Harvest Date"
            type="date"
            required={true}
            icon={<Calendar className="w-4 h-4" />}
            error={errors.expectedHarvestDate?.message}
            {...register('expectedHarvestDate')}
          />
          {calculatedDurationDays > 0 && (
            <span className="text-[11px] font-semibold text-primary flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-accent" /> Auto-Calculated Duration: {calculatedDurationDays} Days
            </span>
          )}
        </div>
      </div>

      {/* Expected Production & Target Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Expected Production (kg)"
          type="number"
          placeholder="e.g. 3500"
          required={true}
          icon={<Weight className="w-4 h-4" />}
          error={errors.expectedProduction?.message}
          {...register('expectedProduction')}
        />

        <Input
          label="Target Selling Price (₹/kg)"
          type="number"
          placeholder="e.g. 420"
          required={true}
          icon={<IndianRupee className="w-4 h-4" />}
          error={errors.expectedSellingPrice?.message}
          {...register('expectedSellingPrice')}
        />
      </div>

      {/* Notes */}
      <Textarea
        label="Notes & Observations (Optional)"
        placeholder="Add details on nursery phase, feed protocol, target ABW, etc."
        rows={3}
        error={errors.notes?.message}
        {...register('notes')}
      />

      {/* Action Buttons */}
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
          {isEditing ? 'Update Crop Batch' : 'Register Crop'}
        </Button>
      </div>
    </form>
  );
};

export default CropForm;
