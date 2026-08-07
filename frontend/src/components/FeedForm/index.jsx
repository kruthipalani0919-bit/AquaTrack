import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UtensilsCrossed, Container, Calendar, IndianRupee, Package, Layers } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Button } from '../Button';

import {
  FEED_BRAND_OPTIONS,
  FEED_TYPE_OPTIONS,
  FEED_SIZE_OPTIONS
} from '../../constants/feedData';
import { useTanks } from '../../context/TankContext';

// Zod Validation Schema matching backend contract (POST /api/feed)
const feedSchema = z.object({
  tankId: z
    .string()
    .min(1, 'Please select a Tank / Pond'),
  date: z
    .string()
    .min(1, 'Date is required'),
  feedType: z
    .string()
    .min(1, 'Please select a Feed Type'),
  feedBrand: z
    .string()
    .min(1, 'Please select a Feed Brand'),
  feedSize: z
    .string()
    .min(1, 'Please select a Feed Size'),
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
 * Contains ONLY backend-supported fields: tankId, date, feedType, feedBrand, feedSize, quantity, costPerKg, notes.
 * Note: totalCost is NOT calculated or submitted in the backend payload.
 */
export const FeedForm = ({
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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(feedSchema),
    defaultValues: {
      tankId: '',
      date: new Date().toISOString().split('T')[0],
      feedType: '',
      feedBrand: '',
      feedSize: '',
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
        feedType: initialData.feedType || '',
        feedBrand: initialData.feedBrand || '',
        feedSize: initialData.feedSize || '1.2mm',
        quantity: initialData.quantity || initialData.quantityKg || '',
        costPerKg: initialData.costPerKg || (initialData.feedCost && initialData.quantityKg ? initialData.feedCost / initialData.quantityKg : ''),
        notes: initialData.notes || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    const selectedTankObj = tanks.find((t) => t.id === data.tankId);

    // Backend Request Model: { tankId, date, feedType, feedBrand, feedSize, quantity, costPerKg, notes }
    // Rule: The frontend must NOT calculate totalCost in the backend payload.
    const feedPayload = {
      tankId: data.tankId,
      date: data.date,
      feedType: data.feedType,
      feedBrand: data.feedBrand,
      feedSize: data.feedSize,
      quantity: parseFloat(data.quantity),
      costPerKg: parseFloat(data.costPerKg),
      notes: data.notes ? data.notes.trim() : '',
    };

    console.log('Backend Feed Payload:', feedPayload);

    if (onSubmit) {
      onSubmit({
        ...feedPayload,
        tankName: selectedTankObj ? selectedTankObj.name : 'Selected Pond',
        // Display helpers for local mock list
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
            label="Select Pond / Tank"
            required={true}
            placeholder="Choose pond..."
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
          <Select
            label="Feed Brand"
            required={true}
            placeholder="Select brand..."
            options={FEED_BRAND_OPTIONS}
            error={errors.feedBrand?.message}
            {...register('feedBrand')}
          />

          <Select
            label="Feed Type"
            required={true}
            placeholder="Select type..."
            options={FEED_TYPE_OPTIONS}
            error={errors.feedType?.message}
            {...register('feedType')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Feed Size / Pellet Size"
            required={true}
            placeholder="Select size..."
            options={FEED_SIZE_OPTIONS}
            error={errors.feedSize?.message}
            {...register('feedSize')}
          />
        </div>
      </div>

      {/* SECTION 3: QUANTITY & COST (Prominent Section) */}
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
          className="font-semibold"
        >
          {isEditing ? 'Update Feed Log' : 'Save Feed Record'}
        </Button>
      </div>
    </form>
  );
};

export default FeedForm;
