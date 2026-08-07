import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sprout, Calendar, Sparkles, Container } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Button } from '../Button';

import { SEED_VARIETY_OPTIONS } from '../../constants/cropData';
import { useTanks } from '../../context/TankContext';

// Zod Validation Schema matching required user-visible fields
const cropSchema = z.object({
  tankId: z
    .string()
    .min(1, 'Please select a Tank / Pond'),
  cropName: z
    .string()
    .min(1, 'Crop Name / Batch Name is required')
    .trim(),
  seedVariety: z
    .string()
    .min(1, 'Please select a Seed Variety / Species'),
  plCount: z
    .coerce
    .number({ invalid_type_error: 'PL Count must be a number' })
    .positive('PL Count must be greater than 0'),
  stockingDate: z
    .string()
    .min(1, 'Stocking Date is required'),
  notes: z
    .string()
    .optional(),
});

/**
 * Reusable CropForm component for Registering and Editing crops.
 * Displays ONLY user-essential fields: Pond/Tank, Crop Name, Seed Variety, PL Count, Stocking Date, Notes.
 * Computes default values internally for expectedHarvestDate, expectedProduction, and expectedSellingPrice
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
      cropName: '',
      seedVariety: '',
      plCount: '',
      stockingDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (initialData) {
      reset({
        tankId: initialData.tankId || '',
        cropName: initialData.cropName || '',
        seedVariety: initialData.seedVariety || '',
        plCount: initialData.plCount || '',
        stockingDate: initialData.stockingDate || new Date().toISOString().split('T')[0],
        notes: initialData.notes || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    const selectedTankObj = tanks.find((t) => t.id === data.tankId);

    // Compute internal fallback defaults to ensure backend API request compliance
    const stockingTime = data.stockingDate ? new Date(data.stockingDate).getTime() : Date.now();
    const computedHarvestDate = new Date(stockingTime + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const parsedPl = parseFloat(data.plCount) || 100000;
    const computedProduction = initialData?.expectedProduction || Math.round(parsedPl * 0.015);
    const computedSellingPrice = initialData?.expectedSellingPrice || 350;

    // Full Backend Payload
    const cropPayload = {
      tankId: data.tankId,
      cropName: data.cropName.trim(),
      seedVariety: data.seedVariety,
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
        tankName: selectedTankObj ? selectedTankObj.name : 'Selected Pond',
        expectedProductionKg: cropPayload.expectedProduction,
        expectedSellingPricePerKg: cropPayload.expectedSellingPrice,
        status: initialData?.status || 'Active',
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
            label="Pond / Tank"
            required={true}
            placeholder="Choose pond..."
            options={tankSelectOptions}
            error={errors.tankId?.message}
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
      </div>

      {/* SECTION 2: CROP DETAILS */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary border-b border-border/50 pb-1 flex items-center gap-1.5">
          <Sprout className="w-3.5 h-3.5 text-primary" /> Crop Specifications
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Crop Name / Batch Name"
            type="text"
            placeholder="e.g. Batch 2026-A"
            required={true}
            icon={<Sprout className="w-4 h-4" />}
            error={errors.cropName?.message}
            {...register('cropName')}
          />

          <Select
            label="Seed Variety / Species"
            required={true}
            placeholder="Select species..."
            options={SEED_VARIETY_OPTIONS}
            error={errors.seedVariety?.message}
            {...register('seedVariety')}
          />
        </div>
      </div>

      {/* SECTION 3: PL COUNT (PROMINENT) */}
      <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-2 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Stocking Quantity
        </h4>
        <Input
          label="PL Count (Post-Larvae Seed Quantity)"
          type="number"
          placeholder="e.g. 150000"
          required={true}
          icon={<Sparkles className="w-4 h-4 text-primary" />}
          error={errors.plCount?.message}
          {...register('plCount')}
        />
      </div>

      {/* SECTION 4: NOTES (OPTIONAL) */}
      <div>
        <Textarea
          label="Notes (Optional)"
          placeholder="Add additional notes..."
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
          className="font-semibold"
        >
          {isEditing ? 'Update Crop' : 'Register Crop'}
        </Button>
      </div>
    </form>
  );
};

export default CropForm;
