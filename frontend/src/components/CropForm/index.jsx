import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sprout, Calendar, Container, Tag, Scale } from 'lucide-react';

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
  seedQuantity: z
    .coerce
    .number({ invalid_type_error: 'Seed Quantity must be a number' })
    .positive('Seed Quantity must be greater than 0'),
  seedVariety: z
    .string()
    .min(2, 'Seed Variety must be at least 2 characters')
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
 * - Highlighted "Crop Specifications" section: Seed Quantity, Seed Variety (full width) stacked above Batch Number (full width)
 * - Row 3: Notes (Optional)
 * Sends exact required payload (tankId, stockingDate, seedQuantity, seedVariety, batchNumber, notes) matching backend createCropSchema.
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
      seedQuantity: '',
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
        seedQuantity: initialData.seedQuantity ?? '',
        seedVariety: initialData.seedVariety || '',
        batchNumber: initialData.batchNumber || initialData.cropName || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    const selectedTankObj = tanks.find((t) => t.id === data.tankId);

    // Exact Backend Payload matching createCropSchema: { tankId, stockingDate, seedQuantity, seedVariety, batchNumber, notes }
    const cropPayload = {
      tankId: data.tankId,
      stockingDate: data.stockingDate,
      seedQuantity: Number(data.seedQuantity),
      seedVariety: data.seedVariety.trim(),
      batchNumber: data.batchNumber.trim(),
      notes: data.notes ? data.notes.trim() : undefined,
    };

    if (onSubmit) {
      onSubmit({
        ...cropPayload,
        cropName: cropPayload.batchNumber,
        tankName: selectedTankObj ? selectedTankObj.name : 'Selected Tank',
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
          {/* SEED QUANTITY (Full Width Row - ABOVE Seed Variety) */}
          <Input
            label="Seed Quantity"
            type="number"
            step="any"
            min="0.01"
            placeholder="Enter seed quantity..."
            required={true}
            icon={<Scale className="w-4 h-4 text-primary" />}
            error={errors.seedQuantity?.message}
            {...register('seedQuantity')}
          />

          {/* SEED VARIETY (Full Width Row) */}
          <Input
            label="Seed Variety"
            type="text"
            placeholder="Enter seed variety..."
            required={true}
            icon={<Sprout className="w-4 h-4 text-primary" />}
            error={errors.seedVariety?.message}
            {...register('seedVariety')}
          />

          {/* BATCH NUMBER (Full Width Row) */}
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
          disabled={isSubmitting}
          className="font-semibold"
        >
          {isEditing ? (isSubmitting ? 'Updating...' : 'Update Crop') : (isSubmitting ? 'Registering...' : 'Register Crop')}
        </Button>
      </div>
    </form>
  );
};

export default CropForm;
