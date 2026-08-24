import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import medicineService from '../services/medicineService';
import { useAuth } from './AuthContext';
import { emitDataMutation, subscribeToSyncBus } from '../utils/syncBus';

const MedicineContext = createContext(null);

export const MedicineProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [medicineRecords, setMedicineRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMedicineRecords = useCallback(async (isSilent = false) => {
    if (!isAuthenticated) {
      setMedicineRecords([]);
      return;
    }
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await medicineService.getMedicines();
      const list = res.data || res || [];
      const normalized = (Array.isArray(list) ? list : []).map((m) => ({
        ...m,
        applicationDate: m.date ? new Date(m.date).toISOString().split('T')[0] : m.applicationDate,
        quantityUsed: m.quantity ?? m.quantityUsed,
        cost: m.totalCost ?? m.cost ?? (m.quantity * m.costPerUnit),
        tankName: m.crop?.tank?.tankName || m.tankName || 'Tank',
        cropName: m.crop?.cropName || m.cropName || 'Crop',
      }));
      setMedicineRecords(normalized);
    } catch (err) {
      console.error('Error fetching medicine records:', err);
      setError(err.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchMedicineRecords();
  }, [fetchMedicineRecords, token]);

  // Subscribe to sync bus events for cascading cleanup & re-fetch
  useEffect(() => {
    const unsubscribe = subscribeToSyncBus((detail) => {
      if (detail.action === 'DELETE') {
        if (detail.entityType === 'TANK' && detail.payload?.tankId) {
          setMedicineRecords((prev) => prev.filter((m) => String(m.tankId) !== String(detail.payload.tankId)));
        } else if (detail.entityType === 'CROP' && detail.payload?.cropId) {
          setMedicineRecords((prev) => prev.filter((m) => String(m.cropId) !== String(detail.payload.cropId)));
        }
        fetchMedicineRecords(true);
      } else if (['SITE', 'TANK', 'CROP', 'MEDICINE'].includes(detail.entityType)) {
        fetchMedicineRecords(true);
      }
    });
    return unsubscribe;
  }, [fetchMedicineRecords]);

  const addMedicineRecord = async (newMedicineData) => {
    const payload = {
      tankId: newMedicineData.tankId,
      date: newMedicineData.applicationDate || newMedicineData.date || new Date().toISOString().split('T')[0],
      medicineName: newMedicineData.medicineName,
      purpose: newMedicineData.purpose || 'Treatment',
      quantity: parseFloat(newMedicineData.quantityUsed || newMedicineData.quantity),
      unit: newMedicineData.unit || 'L',
      costPerUnit: parseFloat(newMedicineData.costPerUnit || (newMedicineData.cost / newMedicineData.quantityUsed) || 100),
      notes: newMedicineData.notes || undefined,
    };

    const res = await medicineService.createMedicine(payload);
    const created = res.data || res;
    const normalized = {
      ...created,
      applicationDate: created.date ? new Date(created.date).toISOString().split('T')[0] : payload.date,
      quantityUsed: created.quantity,
      cost: created.totalCost,
      tankName: newMedicineData.tankName || 'Tank',
      cropName: newMedicineData.cropName || 'Crop',
    };
    setMedicineRecords((prev) => [normalized, ...prev]);
    emitDataMutation('MEDICINE', 'CREATE', normalized);
    return normalized;
  };

  const updateMedicineRecord = async (id, updatedData) => {
    const payload = {
      ...(updatedData.applicationDate || updatedData.date ? { date: updatedData.applicationDate || updatedData.date } : {}),
      ...(updatedData.medicineName ? { medicineName: updatedData.medicineName } : {}),
      ...(updatedData.purpose ? { purpose: updatedData.purpose } : {}),
      ...(updatedData.unit ? { unit: updatedData.unit } : {}),
      ...(updatedData.quantityUsed || updatedData.quantity
        ? { quantity: parseFloat(updatedData.quantityUsed || updatedData.quantity) }
        : {}),
      ...(updatedData.costPerUnit ? { costPerUnit: parseFloat(updatedData.costPerUnit) } : {}),
      ...(updatedData.notes !== undefined ? { notes: updatedData.notes } : {}),
    };

    const res = await medicineService.updateMedicine(id, payload);
    const updated = res.data || res;
    const normalized = {
      ...updated,
      applicationDate: updated.date ? new Date(updated.date).toISOString().split('T')[0] : updatedData.applicationDate,
      quantityUsed: updated.quantity ?? updatedData.quantityUsed,
      cost: updated.totalCost ?? updatedData.cost,
      tankName: updated.crop?.tank?.tankName || 'Tank',
      cropName: updated.crop?.cropName || 'Crop',
    };
    setMedicineRecords((prev) => prev.map((rec) => (String(rec.id) === String(id) ? { ...rec, ...normalized } : rec)));
    emitDataMutation('MEDICINE', 'UPDATE', normalized);
    return normalized;
  };

  const deleteMedicineRecord = async (id) => {
    if (!id) return;
    try {
      await medicineService.deleteMedicine(id);
    } catch (err) {
      console.warn('Backend medicine delete notice:', err.message);
    }
    setMedicineRecords((prev) => prev.filter((rec) => String(rec.id) !== String(id)));
    emitDataMutation('MEDICINE', 'DELETE', { id: String(id) });
  };

  const getMedicineRecordById = (id) => {
    return medicineRecords.find((rec) => String(rec.id) === String(id));
  };

  // Analytics Computation
  const analytics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    const totalTreatments = medicineRecords.length;

    const medicinesUsedToday = medicineRecords.reduce((acc, rec) => {
      if (rec.applicationDate === todayStr) {
        return acc + 1;
      }
      return acc;
    }, 0);

    const totalMedicineCostRupees = medicineRecords.reduce((acc, rec) => acc + (parseFloat(rec.cost) || 0), 0);

    return {
      totalTreatments,
      medicinesUsedToday,
      totalMedicineCostRupees,
    };
  }, [medicineRecords]);

  return (
    <MedicineContext.Provider
      value={{
        medicineRecords,
        loading,
        error,
        fetchMedicineRecords,
        addMedicineRecord,
        updateMedicineRecord,
        deleteMedicineRecord,
        getMedicineRecordById,
        analytics,
      }}
    >
      {children}
    </MedicineContext.Provider>
  );
};

export const useMedicine = () => {
  const context = useContext(MedicineContext);
  if (!context) {
    throw new Error('useMedicine must be used within a MedicineProvider');
  }
  return context;
};

export default MedicineContext;
