import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stethoscope, Calendar, IndianRupee, Package, Container, AlertCircle } from 'lucide-react';

import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Button } from '../Button';
import { useTanks } from '../../context/TankContext';
import { useStocking } from '../../context/StockingContext';

// Zod Validation Schema matching required frontend fields
const medicineSchema = z.object({
  tankId: z
    .string()
    .min(1, 'Please select a Tank'),
  medicineName: z
    .string()
    .min(1, 'Medicine Name is required')
    .trim(),
  quantity: z
    .coerce
    .number({ invalid_type_error: 'Quantity must be a number' })
    .positive('Quantity must be greater than 0'),
  cost: z
    .coerce
    .number({ invalid_type_error: 'Cost must be a number' })
    .min(0, 'Cost cannot be negative'),
  date: z
    .string()
    .min(1, 'Application Date is required'),
  notes: z
    .string()
    .optional(),
});

/**
 * Reusable MedicineForm component with dynamic Tank dropdown from TankContext
 * and real-time Site Stock Availability indicator and validation.
 */
export const MedicineForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  formError = '',
}) => {
  const { tanks = [] } = useTanks();
  const { stockings = [] } = useStocking();
  const isEditing = Boolean(initialData?.id);

  // Format Tank label cleanly WITHOUT water source (e.g. A1 or A1 (5 Acres))
  const tankSelectOptions = tanks.map((tank) => {
    const rawName = tank.name || tank.tankName || 'Tank';
    const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim();
    const areaSuffix = tank.area ? ` (${tank.area} Acres)` : '';
    return {
      value: tank.id,
      label: `${cleanName}${areaSuffix}`,
    };
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      tankId: '',
      medicineName: '',
      quantity: '',
      cost: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
    mode: 'onTouched',
  });

  const selectedTankId = watch('tankId');
  const quantityValue = watch('quantity');
  const enteredQuantity = parseFloat(quantityValue) || 0;

  // Identify selected tank and site
  const selectedTank = useMemo(() => {
    return tanks.find((t) => String(t.id) === String(selectedTankId));
  }, [tanks, selectedTankId]);

  const siteId = selectedTank?.siteId || selectedTank?.site?.id;

  // Compute available medicine stock for selected tank's site
  const siteMedicineStockInfo = useMemo(() => {
    if (!selectedTankId || !siteId) return null;

    let totalAdded = 0;
    let used = 0;
    let unit = 'L';

    stockings.forEach((s) => {
      const isMedicine = s.category?.toUpperCase() === 'MEDICINE';
      const isDirectSite = s.siteId && String(s.siteId) === String(siteId);

      if (isMedicine && isDirectSite) {
        totalAdded += parseFloat(s.totalQuantity) || 0;
        used = parseFloat(s.totalUsed) || 0;
        if (s.unit) unit = s.unit;
      } else if (isMedicine && Array.isArray(s.siteStock)) {
        const alloc = s.siteStock.find((ss) => String(ss.site?.id || ss.siteId) === String(siteId));
        if (alloc) {
          totalAdded += parseFloat(alloc.allocatedQuantity) || 0;
          used = parseFloat(alloc.usedQuantity) || 0;
          if (alloc.unit || s.unit) unit = alloc.unit || s.unit;
        }
      }
    });

    const currentRecordQty = isEditing ? (parseFloat(initialData?.quantity) || 0) : 0;
    const effectiveUsed = Math.max(used - currentRecordQty, 0);
    const remaining = Math.max(totalAdded - effectiveUsed, 0);
    const siteName = selectedTank?.site?.siteName || selectedTank?.siteName || 'this site';

    return {
      totalAdded,
      used: effectiveUsed,
      remaining,
      unit,
      siteName,
      hasStock: totalAdded > 0,
    };
  }, [selectedTankId, siteId, stockings, selectedTank, isEditing, initialData]);

  const isExcess = Boolean(siteMedicineStockInfo && siteMedicineStockInfo.hasStock && enteredQuantity > siteMedicineStockInfo.remaining);
  const isNoStock = Boolean(siteMedicineStockInfo && !siteMedicineStockInfo.hasStock);

  const quantityErrorMessage = errors.quantity?.message || (
    isExcess
      ? `Only ${siteMedicineStockInfo.remaining} ${siteMedicineStockInfo.unit} of medicine is available for this site.`
      : isNoStock && enteredQuantity > 0
        ? `No medicine stock added for ${siteMedicineStockInfo.siteName} yet.`
        : undefined
  );

  const isSubmitDisabled = isSubmitting || isExcess || (isNoStock && enteredQuantity > 0);

  useEffect(() => {
    if (initialData) {
      reset({
        tankId: initialData.tankId || '',
        medicineName: initialData.medicineName || '',
        quantity: initialData.quantity || '',
        cost: initialData.cost || '',
        date: initialData.date || initialData.applicationDate || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    if (isExcess || (isNoStock && enteredQuantity > 0)) {
      return;
    }

    const selectedTankObj = tanks.find((t) => t.id === data.tankId);
    const rawTankName = selectedTankObj ? selectedTankObj.name : 'Selected Tank';
    const cleanTankName = rawTankName.replace(/\s*\([^)]*\)/g, '').trim();

    const medicinePayload = {
      tankId: data.tankId,
      medicineName: data.medicineName.trim(),
      purpose: initialData?.purpose || 'Water treatment',
      dosage: initialData?.dosage || 'As required',
      quantity: parseFloat(data.quantity),
      cost: parseFloat(data.cost),
      date: data.date,
      notes: data.notes ? data.notes.trim() : '',
    };

    if (onSubmit) {
      onSubmit({
        ...medicinePayload,
        tankName: cleanTankName,
        applicationDate: medicinePayload.date,
        status: initialData?.status || 'Completed',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
      {/* FORM LEVEL ERROR BANNER */}
      {formError && (
        <div className="p-3.5 rounded-xl bg-danger-light/40 border border-danger/30 text-danger text-xs font-semibold flex items-center gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* SECTION 1: BASIC INFORMATION */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary border-b border-border/50 pb-1 flex items-center gap-1.5">
          <Container className="w-3.5 h-3.5 text-primary" /> Basic Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Select Tank"
            required={true}
            placeholder="Select tank..."
            options={tankSelectOptions}
            error={errors.tankId?.message}
            {...register('tankId')}
          />

          <Input
            label="Application Date"
            type="date"
            required={true}
            icon={<Calendar className="w-4 h-4" />}
            error={errors.date?.message}
            {...register('date')}
          />
        </div>
      </div>

      {/* SECTION 2: MEDICINE DETAILS */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary border-b border-border/50 pb-1 flex items-center gap-1.5">
          <Stethoscope className="w-3.5 h-3.5 text-primary" /> Treatment Details
        </h4>
        <div>
          <Input
            label="Medicine / Chemical Name"
            type="text"
            placeholder="e.g. Probiotic"
            required={true}
            icon={<Stethoscope className="w-4 h-4" />}
            error={errors.medicineName?.message}
            {...register('medicineName')}
          />
        </div>
      </div>

      {/* SECTION 3: QUANTITY & COST */}
      <div className="p-4 rounded-xl bg-primary-light/30 border border-primary/20 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" /> Quantity & Cost
          </h4>

          {selectedTankId && siteMedicineStockInfo && (
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
              isExcess
                ? 'bg-danger-light/60 border-danger/40 text-danger'
                : isNoStock
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-cyan-50 border-cyan-200 text-cyan-800'
            }`}>
              Available: {siteMedicineStockInfo.remaining} {siteMedicineStockInfo.unit}
            </span>
          )}
        </div>

        {/* STOCK AVAILABILITY INDICATOR BADGE */}
        {selectedTankId && siteMedicineStockInfo && (
          <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between font-medium transition-colors ${
            isExcess
              ? 'bg-danger-light/30 border-danger/40 text-danger'
              : isNoStock
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-cyan-50/80 border-cyan-200 text-cyan-800'
          }`}>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-3.5 h-3.5 shrink-0" />
              <span>
                Available Medicine Stock: <strong>{siteMedicineStockInfo.remaining} {siteMedicineStockInfo.unit}</strong>
              </span>
            </div>
            <span className="text-[10px] opacity-80">({siteMedicineStockInfo.siteName})</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Quantity"
            type="number"
            step="0.1"
            placeholder="e.g. 5"
            required={true}
            icon={<Package className="w-4 h-4 text-primary" />}
            error={quantityErrorMessage}
            {...register('quantity')}
          />

          <Input
            label="Treatment Cost (₹)"
            type="number"
            placeholder="e.g. 999"
            required={true}
            icon={<IndianRupee className="w-4 h-4 text-primary" />}
            error={errors.cost?.message}
            {...register('cost')}
          />
        </div>
      </div>

      {/* SECTION 4: APPLICATION NOTES (OPTIONAL) */}
      <div>
        <Textarea
          label="Application Notes (Optional)"
          placeholder="Add any notes..."
          rows={2}
          error={errors.notes?.message}
          {...register('notes')}
        />
      </div>

      {/* ACTIONS */}
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
          disabled={isSubmitDisabled}
          className="font-semibold"
        >
          {isEditing ? (isSubmitting ? 'Updating...' : 'Update Treatment Record') : (isSubmitting ? 'Recording...' : 'Save Treatment')}
        </Button>
      </div>
    </form>
  );
};

export default MedicineForm;
