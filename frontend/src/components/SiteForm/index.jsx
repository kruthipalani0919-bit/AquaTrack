import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, ShieldAlert, Building, Layers } from 'lucide-react';

import { Input } from '../Input';
import { Button } from '../Button';

// Zod Validation Schema strictly matching required fields: Site Name, Land Area (Acres), Location
const siteSchema = z.object({
  siteName: z
    .string()
    .min(2, 'Site name must be at least 2 characters')
    .trim(),
  landArea: z
    .coerce
    .number({ invalid_type_error: 'Land area must be a valid number' })
    .positive('Land area must be greater than 0'),
  location: z
    .string()
    .min(2, 'Location is required')
    .trim(),
});

/**
 * Reusable SiteForm component for Add & Edit Site operations.
 * Simplified structure:
 * 1. SITE NAME *
 * 2. LAND DETAILS (Land Area in Acres *)
 * 3. LOCATION *
 */
export const SiteForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error = null,
}) => {
  const isEditing = Boolean(initialData?.id);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      siteName: '',
      landArea: '',
      location: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (initialData) {
      reset({
        siteName: initialData.siteName || '',
        landArea: initialData.landArea ?? initialData.area ?? initialData.totalArea ?? '',
        location: initialData.location || '',
      });
    } else {
      reset({
        siteName: '',
        landArea: '',
        location: '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data) => {
    setFormError('');
    try {
      if (onSubmit) {
        await onSubmit({
          siteName: data.siteName.trim(),
          landArea: Number(data.landArea),
          area: Number(data.landArea),
          location: data.location.trim(),
        });
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save site.');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4" noValidate>
      {(error || formError) && (
        <div className="p-3 rounded-xl bg-danger-light/30 border border-danger/30 flex items-center gap-2.5 text-danger text-xs font-medium">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error || formError}</span>
        </div>
      )}

      {/* 1. SITE NAME */}
      <Input
        label="Site Name"
        type="text"
        placeholder="e.g. North Zone Site 1"
        required={true}
        icon={<Building className="w-4 h-4 text-primary" />}
        error={errors.siteName?.message}
        {...register('siteName')}
      />

      {/* 2. LAND DETAILS (VISUALLY CUSTOMIZED CARD SECTION) */}
      <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-3 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary/20 pb-1.5">
          <Layers className="w-3.5 h-3.5 text-primary" /> Land Details
        </h4>
        <Input
          label="Land Area (Acres)"
          type="number"
          step="0.01"
          placeholder="e.g. 5.5"
          required={true}
          icon={<Layers className="w-4 h-4 text-primary" />}
          error={errors.landArea?.message}
          {...register('landArea')}
        />
      </div>

      {/* 3. LOCATION */}
      <Input
        label="Location"
        type="text"
        placeholder="e.g. Near Coastal Highway, Village Rampur"
        required={true}
        icon={<MapPin className="w-4 h-4" />}
        error={errors.location?.message}
        {...register('location')}
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
          disabled={isSubmitting}
          className="font-semibold"
        >
          {isEditing ? (isSubmitting ? 'Updating...' : 'Update Site') : (isSubmitting ? 'Registering...' : 'Save Site')}
        </Button>
      </div>
    </form>
  );
};

export default SiteForm;
