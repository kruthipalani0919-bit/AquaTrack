import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Button } from '../Button';
import { useSites } from '../../context/SiteContext';

// Zod Validation Schema strictly matching frontend required fields
const tankSchema = z.object({
  siteId: z
    .string()
    .min(1, 'Please select a Site'),
  tankName: z
    .string()
    .min(1, 'Tank Name is required')
    .trim(),
  area: z
    .coerce
    .number({ invalid_type_error: 'Area must be a number' })
    .positive('Area must be greater than 0'),
  remarks: z
    .string()
    .optional(),
});

/**
 * Reusable TankForm component for Add & Edit tank operations.
 * - Select Site dropdown formats site label cleanly as `${s.siteName} (${s.location})`
 *   without district or null strings.
 * - Blue highlighted container (Tank Details) contains ONLY Tank Name and Area (Acres) stacked vertically.
 * - Remarks / Notes is BELOW the blue container.
 * Computes internal fallbacks for depth and waterSource for 100% backend API contract safety.
 */
export const TankForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultSiteId = '',
}) => {
  const isEditing = Boolean(initialData?.id);
  const { sites = [], loading: sitesLoading } = useSites();

  // Clean Site label formatting without district or null
  const siteOptions = sites.map((s) => {
    const siteName = s.siteName || 'Site';
    const locationSuffix = s.location ? ` (${s.location})` : '';
    return {
      value: s.id,
      label: `${siteName}${locationSuffix}`,
    };
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tankSchema),
    defaultValues: {
      siteId: '',
      tankName: '',
      area: '',
      remarks: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (initialData) {
      reset({
        siteId: initialData.siteId || defaultSiteId || (sites.length === 1 ? sites[0].id : ''),
        tankName: initialData.tankName || initialData.name || '',
        area: initialData.area || '',
        remarks: initialData.remarks || '',
      });
    } else {
      reset({
        siteId: defaultSiteId || (sites.length === 1 ? sites[0].id : ''),
        tankName: '',
        area: '',
        remarks: '',
      });
    }
  }, [initialData, defaultSiteId, sites, reset]);

  const handleFormSubmit = (data) => {
    // Backend Tank Request Model: { siteId, tankName, area, depth, waterSource, remarks }
    const tankPayload = {
      siteId: data.siteId,
      tankName: data.tankName.trim(),
      area: parseFloat(data.area),
      depth: parseFloat(initialData?.depth || 6),
      waterSource: initialData?.waterSource || 'Borewell',
      remarks: data.remarks ? data.remarks.trim() : undefined,
    };

    if (onSubmit) {
      onSubmit(tankPayload);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4" noValidate>
      {/* 1. SELECT SITE */}
      <Select
        label="Select Site"
        required={true}
        placeholder="Choose site location..."
        options={siteOptions}
        disabled={sitesLoading}
        error={errors.siteId?.message}
        {...register('siteId')}
      />

      {/* 2. TANK DETAILS CARD (BLUE HIGHLIGHTED CONTAINER FOR TANK NAME & AREA) */}
      <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-4 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary/20 pb-1.5">
          Tank Details
        </h4>
        <div className="flex flex-col gap-4">
          <Input
            label="Tank Name"
            type="text"
            placeholder="e.g. Tank 1"
            required={true}
            error={errors.tankName?.message}
            {...register('tankName')}
          />

          <Input
            label="Area (Acres)"
            type="number"
            step="0.01"
            placeholder="e.g. 2.5"
            required={true}
            error={errors.area?.message}
            {...register('area')}
          />
        </div>
      </div>

      {/* 3. REMARKS / NOTES (OPTIONAL) */}
      <Textarea
        label="Remarks / Notes (Optional)"
        placeholder="Add any operational notes or remarks..."
        rows={2}
        error={errors.remarks?.message}
        {...register('remarks')}
      />

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
          {isEditing ? 'Update Tank' : 'Save Tank'}
        </Button>
      </div>
    </form>
  );
};

export default TankForm;
