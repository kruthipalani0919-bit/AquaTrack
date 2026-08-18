import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Container, Maximize2, MapPin, ShieldAlert } from 'lucide-react';

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
 * - Select Site is ABOVE the blue highlighted container.
 * - Blue highlighted container (Tank Details) contains ONLY Tank Name and Area (Acres) stacked vertically.
 * - Remarks / Notes is BELOW the blue container.
 * - Depth and Water Source are removed from UI.
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

  const siteOptions = sites.map((s) => ({
    value: s.id,
    label: `${s.siteName} (${s.location}, ${s.district})`,
  }));

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

    console.log('Tank Payload with siteId:', tankPayload);

    if (onSubmit) {
      onSubmit({
        ...tankPayload,
        name: tankPayload.tankName,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4" noValidate>
      {/* Empty Site Warning Banner */}
      {!sitesLoading && sites.length === 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-700 font-medium">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
            <span>No sites found. You must create a Site before adding a Tank.</span>
          </div>
          <Link to="/sites" className="underline font-bold text-primary hover:text-primary-dark shrink-0">
            + Create Site
          </Link>
        </div>
      )}

      {/* 1. SELECT SITE (ABOVE BLUE CONTAINER) */}
      <Select
        label="Select Site"
        required={true}
        placeholder={sitesLoading ? 'Loading sites...' : 'Choose site location...'}
        options={siteOptions}
        disabled={sites.length === 0 || isSubmitting}
        error={errors.siteId?.message}
        icon={<MapPin className="w-4 h-4" />}
        {...register('siteId')}
      />

      {/* 2. HIGHLIGHTED CONTAINER: TANK DETAILS (ONLY TANK NAME + AREA) */}
      <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-3 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-primary/20 pb-1.5">
          <Container className="w-3.5 h-3.5 text-primary" /> Tank Details
        </h4>
        <div className="flex flex-col gap-3">
          {/* Tank Name */}
          <Input
            label="Tank Name"
            type="text"
            placeholder="e.g. Pond P-1 (Vannamei Main)"
            required={true}
            icon={<Container className="w-4 h-4 text-primary" />}
            error={errors.tankName?.message}
            disabled={sites.length === 0 || isSubmitting}
            {...register('tankName')}
          />

          {/* Area (Acres) */}
          <Input
            label="Area (Acres)"
            type="number"
            step="0.1"
            min="0.1"
            placeholder="e.g. 2.5"
            required={true}
            icon={<Maximize2 className="w-4 h-4 text-primary" />}
            error={errors.area?.message}
            disabled={sites.length === 0 || isSubmitting}
            {...register('area')}
          />
        </div>
      </div>

      {/* 3. REMARKS / NOTES (BELOW BLUE CONTAINER) */}
      <Textarea
        label="Remarks / Notes (Optional)"
        placeholder="Add details on PL stocking count, soil treatment, aerators, etc."
        rows={3}
        error={errors.remarks?.message}
        disabled={sites.length === 0 || isSubmitting}
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
          disabled={sites.length === 0}
          className="font-semibold"
        >
          {isEditing ? 'Update Tank' : 'Save Tank'}
        </Button>
      </div>
    </form>
  );
};

export default TankForm;
