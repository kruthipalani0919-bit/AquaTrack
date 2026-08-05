import React from 'react';
import { Waves, Calendar, Clock, Edit3, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { SAFE_WATER_RANGES } from '../../constants/waterQualityData';

/**
 * Reusable WaterDetailsModal component displaying per-parameter safe-range evaluations.
 */
export const WaterDetailsModal = ({
  isOpen = false,
  onClose,
  record,
  onEdit,
  onDelete,
}) => {
  if (!record) return null;

  const {
    id,
    tankName,
    testDate,
    testTime,
    ph,
    temperature,
    dissolvedOxygen,
    salinity,
    ammonia,
    nitrite,
    alkalinity,
    waterLevel,
    status,
    notes,
  } = record;

  const evaluateParam = (key, val) => {
    const num = parseFloat(val) || 0;
    if (key === 'ph') {
      if (num < 7.0 || num > 9.0) return { label: 'Critical', variant: 'danger' };
      if (num < 7.5 || num > 8.5) return { label: 'Warning', variant: 'warning' };
      return { label: 'Optimal', variant: 'success' };
    }
    if (key === 'dissolvedOxygen') {
      if (num < 3.5) return { label: 'Critical', variant: 'danger' };
      if (num < 5.0) return { label: 'Warning', variant: 'warning' };
      return { label: 'Optimal', variant: 'success' };
    }
    if (key === 'ammonia') {
      if (num > 0.5) return { label: 'Critical', variant: 'danger' };
      if (num > 0.1) return { label: 'Warning', variant: 'warning' };
      return { label: 'Optimal', variant: 'success' };
    }
    if (key === 'nitrite') {
      if (num > 1.0) return { label: 'Critical', variant: 'danger' };
      if (num > 0.2) return { label: 'Warning', variant: 'warning' };
      return { label: 'Optimal', variant: 'success' };
    }
    if (key === 'temperature') {
      if (num < 24 || num > 33) return { label: 'Critical', variant: 'danger' };
      if (num < 26 || num > 31) return { label: 'Warning', variant: 'warning' };
      return { label: 'Optimal', variant: 'success' };
    }
    return { label: 'Optimal', variant: 'success' };
  };

  const parametersList = [
    { key: 'ph', title: 'pH Level', val: ph, unit: '', target: '7.5 - 8.5' },
    { key: 'dissolvedOxygen', title: 'Dissolved Oxygen', val: dissolvedOxygen, unit: 'mg/L', target: '>= 5.0 mg/L' },
    { key: 'temperature', title: 'Temperature', val: temperature, unit: '°C', target: '26.0 - 31.0 °C' },
    { key: 'salinity', title: 'Salinity', val: salinity, unit: 'ppt', target: '10.0 - 25.0 ppt' },
    { key: 'ammonia', title: 'Ammonia (TAN)', val: ammonia, unit: 'ppm', target: '<= 0.10 ppm' },
    { key: 'nitrite', title: 'Nitrite (NO2)', val: nitrite, unit: 'ppm', target: '<= 0.20 ppm' },
    { key: 'alkalinity', title: 'Alkalinity', val: alkalinity, unit: 'ppm', target: '100 - 150 ppm' },
    { key: 'waterLevel', title: 'Water Level', val: waterLevel, unit: 'm', target: '1.2 - 2.0 m' },
  ];

  const statusVariantMap = {
    Normal: 'success',
    Warning: 'warning',
    Critical: 'danger',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tankName}
      description={`Water Sampling Log • ${testDate} at ${testTime}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Overall Status Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold text-text-primary">Overall Water Status Evaluation</span>
          </div>
          <Badge variant={statusVariantMap[status] || 'primary'}>
            {status}
          </Badge>
        </div>

        {/* Per-Parameter Safe Range Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {parametersList.map((p) => {
            const evalResult = evaluateParam(p.key, p.val);
            return (
              <div key={p.key} className="p-3 rounded-lg bg-surface border border-border flex flex-col justify-between gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold text-text-secondary">{p.title}</span>
                  <Badge variant={evalResult.variant} size="sm" className="text-[9px] px-1.5 py-0">
                    {evalResult.label}
                  </Badge>
                </div>

                <span className="text-base font-bold text-text-primary">
                  {p.val} <span className="text-xs font-normal text-text-secondary">{p.unit}</span>
                </span>

                <span className="text-[10px] text-text-secondary font-medium pt-1 border-t border-border/40">
                  Target: {p.target}
                </span>
              </div>
            );
          })}
        </div>

        {/* Notes */}
        {notes && (
          <div className="p-3.5 rounded-xl bg-background border border-border">
            <span className="text-xs font-bold text-text-primary block mb-1">Sampling Notes & Field Diagnostics</span>
            <p className="text-xs text-text-secondary leading-relaxed">{notes}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(record)}
            icon={<Edit3 className="w-4 h-4" />}
          >
            Edit Record
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(record)}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default WaterDetailsModal;
