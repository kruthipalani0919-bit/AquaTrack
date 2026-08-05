import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UtensilsCrossed, Container, Calendar, Clock, IndianRupee, Package, Sparkles } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Button } from '../Button';

import {
  FEED_BRAND_OPTIONS,
  FEED_TYPE_OPTIONS,
  FEEDING_TIME_OPTIONS,
  FEED_STATUS_OPTIONS
} from '../../constants/feedData';
import { useCrops } from '../../context/CropContext';

// Zod Validation Schema
const feedSchema = z.object({
  cropId: z
    .string()
    .min(1, 'Please select a Crop Batch'),
  feedBrand: z
    .string()
    .min(1, 'Please select a Feed Brand'),
  feedType: z
    .string()
    .min(1, 'Please select a Feed Type'),
  quantityKg: z
    .coerce
    .number({ invalid_type_error: 'Quantity must be a number' })
    .positive('Quantity must be greater than 0'),
  feedingDate: z
    .string()
    .min(1, 'Feeding Date is required'),
  feedingTime: z
    .string()
    .min(1, 'Please select a Feeding Time'),
  feedCost: z
    .coerce
    .number({ invalid_type_error: 'Feed Cost must be a number' })
    .positive('Feed Cost must be greater than 0'),
  remainingStockKg: z
    .coerce
    .number({ invalid_type_error: 'Remaining Stock must be a number' })
    .min(0, 'Remaining Stock cannot be negative'),
  status: z
    .string()
    .default('Completed'),
  notes: z
    .string()
    .optional(),
});

/**
 * Reusable FeedForm component with dynamic Crop dropdown from CropContext
 * and auto-filled Tank information.
 */
export const FeedForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { crops } = useCrops();
  const isEditing = Boolean(initialData?.id);

  const cropSelectOptions = crops.map((crop) => ({
    value: crop.id,
    label: `${crop.cropName} (${crop.tankName})`,
  }));

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(feedSchema),
    defaultValues: {
      cropId: '',
      feedBrand: '',
      feedType: '',
      quantityKg: '',
      feedingDate: new Date().toISOString().split('T')[0],
      feedingTime: '06:00 AM',
      feedCost: '',
      remainingStockKg: '',
      status: 'Completed',
      notes: '',
    },
    mode: 'onTouched',
  });

  // Watch selected cropId to auto-fill Tank details
  const selectedCropId = useWatch({ control, name: 'cropId' });

  const autoFilledTank = React.useMemo(() => {
    if (!selectedCropId) return null;
    const matchedCrop = crops.find((c) => c.id === selectedCropId);
    return matchedCrop ? { tankId: matchedCrop.tankId, tankName: matchedCrop.tankName, cropName: matchedCrop.cropName } : null;
  }, [selectedCropId, crops]);

  useEffect(() => {
    if (initialData) {
      reset({
        cropId: initialData.cropId || '',
        feedBrand: initialData.feedBrand || '',
        feedType: initialData.feedType || '',
        quantityKg: initialData.quantityKg || '',
        feedingDate: initialData.feedingDate || '',
        feedingTime: initialData.feedingTime || '06:00 AM',
        feedCost: initialData.feedCost || '',
        remainingStockKg: initialData.remainingStockKg || '',
        status: initialData.status || 'Completed',
        notes: initialData.notes || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    const matchedCrop = crops.find((c) => c.id === data.cropId);
    const payload = {
      ...data,
      cropName: matchedCrop ? matchedCrop.cropName : 'Selected Crop',
      tankId: matchedCrop ? matchedCrop.tankId : 'tank-1',
      tankName: matchedCrop ? matchedCrop.tankName : 'Auto-Filled Pond',
    };

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4" noValidate>
      {/* Crop Selection & Auto-Filled Tank */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Select Active Crop Batch"
          required={true}
          placeholder="Choose crop..."
          options={cropSelectOptions}
          error={errors.cropId?.message}
          {...register('cropId')}
        />

        <div>
          <Input
            label="Tank / Pond (Auto-Filled)"
            type="text"
            value={autoFilledTank ? autoFilledTank.tankName : 'Select a crop to auto-fill tank'}
            disabled={true}
            icon={<Container className="w-4 h-4 text-primary" />}
            className="bg-background text-primary font-semibold"
          />
          {autoFilledTank && (
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Linked to {autoFilledTank.tankName}
            </span>
          )}
        </div>
      </div>

      {/* Feed Brand & Feed Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Feed Brand"
          required={true}
          placeholder="Select brand..."
          options={FEED_BRAND_OPTIONS}
          error={errors.feedBrand?.message}
          {...register('feedBrand')}
        />

        <Select
          label="Feed Type / Pellet Size"
          required={true}
          placeholder="Select type..."
          options={FEED_TYPE_OPTIONS}
          error={errors.feedType?.message}
          {...register('feedType')}
        />
      </div>

      {/* Ration Quantity & Feed Cost */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Feed Ration Quantity (Kg)"
          type="number"
          step="0.5"
          placeholder="e.g. 45"
          required={true}
          icon={<UtensilsCrossed className="w-4 h-4" />}
          error={errors.quantityKg?.message}
          {...register('quantityKg')}
        />

        <Input
          label="Feed Cost (₹)"
          type="number"
          placeholder="e.g. 3150"
          required={true}
          icon={<IndianRupee className="w-4 h-4" />}
          error={errors.feedCost?.message}
          {...register('feedCost')}
        />
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Feeding Date"
          type="date"
          required={true}
          icon={<Calendar className="w-4 h-4" />}
          error={errors.feedingDate?.message}
          {...register('feedingDate')}
        />

        <Select
          label="Feeding Time Slot"
          required={true}
          options={FEEDING_TIME_OPTIONS}
          error={errors.feedingTime?.message}
          {...register('feedingTime')}
        />
      </div>

      {/* Remaining Stock & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Remaining Stock Inventory (Kg)"
          type="number"
          placeholder="e.g. 450"
          required={true}
          icon={<Package className="w-4 h-4" />}
          error={errors.remainingStockKg?.message}
          {...register('remainingStockKg')}
        />

        <Select
          label="Feeding Status"
          required={false}
          options={FEED_STATUS_OPTIONS}
          error={errors.status?.message}
          {...register('status')}
        />
      </div>

      {/* Notes */}
      <Textarea
        label="Tray Check & Observations (Optional)"
        placeholder="Add details on check tray consumption, waste leftover, water turbidity, etc."
        rows={3}
        error={errors.notes?.message}
        {...register('notes')}
      />

      {/* Actions */}
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
          {isEditing ? 'Update Feed Log' : 'Save Feed Record'}
        </Button>
      </div>
    </form>
  );
};

export default FeedForm;
