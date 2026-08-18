import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, ShieldAlert, Building } from 'lucide-react';

import { Input } from '../Input';
import { Textarea } from '../Textarea';
import { Button } from '../Button';

// Zod Validation Schema matching backend contract (POST /api/sites)
const siteSchema = z.object({
  siteName: z
    .string()
    .min(2, 'Site name must be at least 2 characters')
    .trim(),
  location: z
    .string()
    .min(2, 'Location is required')
    .trim(),
  district: z
    .string()
    .min(2, 'District is required')
    .trim(),
  state: z
    .string()
    .min(2, 'State is required')
    .trim(),
  remarks: z
    .string()
    .optional(),
});

/**
 * Reusable SiteForm component for Add & Edit Site operations.
 * Features a light-blue highlighted container around Site Name ONLY.
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
      location: '',
      district: '',
      state: '',
      remarks: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (initialData) {
      reset({
        siteName: initialData.siteName || '',
        location: initialData.location || '',
        district: initialData.district || '',
        state: initialData.state || '',
        remarks: initialData.remarks || '',
      });
    } else {
      reset({
        siteName: '',
        location: '',
        district: '',
        state: '',
        remarks: '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data) => {
    setFormError('');
    try {
      if (onSubmit) {
        await onSubmit({
          siteName: data.siteName.trim(),
          location: data.location.trim(),
          district: data.district.trim(),
          state: data.state.trim(),
          remarks: data.remarks ? data.remarks.trim() : undefined,
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

      {/* HIGHLIGHTED CONTAINER: SITE INFORMATION (SITE NAME ONLY) */}
      <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-3 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary/20 pb-1.5">
          <Building className="w-3.5 h-3.5 text-primary" /> Site Information
        </h4>
        <Input
          label="Site Name"
          type="text"
          placeholder="e.g. North Zone Site 1"
          required={true}
          icon={<Building className="w-4 h-4 text-primary" />}
          error={errors.siteName?.message}
          {...register('siteName')}
        />
      </div>

      {/* LOCATION (OUTSIDE HIGHLIGHTED SECTION) */}
      <Input
        label="Location"
        type="text"
        placeholder="e.g. Near Coastal Highway, Village Rampur"
        required={true}
        icon={<MapPin className="w-4 h-4" />}
        error={errors.location?.message}
        {...register('location')}
      />

      {/* DISTRICT & STATE ROW (OUTSIDE HIGHLIGHTED SECTION) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="District"
          type="text"
          placeholder="e.g. Nellore"
          required={true}
          icon={<MapPin className="w-4 h-4" />}
          error={errors.district?.message}
          {...register('district')}
        />

        <Input
          label="State"
          type="text"
          placeholder="e.g. Andhra Pradesh"
          required={true}
          icon={<MapPin className="w-4 h-4" />}
          error={errors.state?.message}
          {...register('state')}
        />
      </div>

      {/* REMARKS (OPTIONAL) (OUTSIDE HIGHLIGHTED SECTION) */}
      <Textarea
        label="Remarks / Notes (Optional)"
        placeholder="Add details on site infrastructure, soil type, access roads, etc."
        rows={3}
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
          {isEditing ? 'Update Site' : 'Save Site'}
        </Button>
      </div>
    </form>
  );
};

export default SiteForm;
