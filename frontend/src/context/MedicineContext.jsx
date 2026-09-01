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
      const normalized = (Array.isArray(list) ? list : []).map((rec) => ({
        ...rec,
        id: String(rec.id),
        applicationDate: rec.date ? new Date(rec.date).toISOString().split('T')[0] : rec.applicationDate,
        tankName: rec.tank?.tankName || rec.tankName || 'Tank',
        dosage: rec.dosage ? String(rec.dosage) : '1',
        cost: parseFloat(rec.cost) || 0,
        quantity: parseFloat(rec.quantity) || 1,
        status: 'Completed',
      }));
      setMedicineRecords(normalized);
    } catch (err) {
      console.error('Error fetching medicines:', err);
      setError(err.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchMedicineRecords();
  }, [fetchMedicineRecords, token]);

  // Subscribe to sync bus events for cascading medicine cleanup & reactive tank updates
  useEffect(() => {
    const unsubscribe = subscribeToSyncBus((detail) => {
      if (detail.action === 'DELETE') {
        if (detail.entityType === 'SITE' && detail.payload?.siteId) {
          setMedicineRecords((prev) => prev.filter((m) => String(m.tank?.siteId || m.siteId) !== String(detail.payload.siteId)));
        } else if (detail.entityType === 'TANK' && detail.payload?.tankId) {
          setMedicineRecords((prev) => prev.filter((m) => String(m.tankId) !== String(detail.payload.tankId)));
        }
        fetchMedicineRecords(true);
      } else if (['SITE', 'TANK', 'CROP', 'MEDICINE'].includes(detail.entityType)) {
        fetchMedicineRecords(true);
      }
    });
    return unsubscribe;
  }, [fetchMedicineRecords]);

  const addMedicineRecord = async (newRecordData) => {
    const payload = {
      tankId: newRecordData.tankId,
      medicineName: newRecordData.medicineName,
      purpose: newRecordData.purpose || 'Health treatment',
      dosage: String(newRecordData.dosage),
      quantity: parseFloat(newRecordData.quantity || 1),
      cost: parseFloat(newRecordData.cost || 0),
      date: newRecordData.applicationDate || newRecordData.date || new Date().toISOString().split('T')[0],
      notes: newRecordData.notes || undefined,
    };

    const res = await medicineService.createMedicine(payload);
    const created = res.data || res;
    const normalized = {
      ...created,
      id: String(created.id),
      applicationDate: created.date ? new Date(created.date).toISOString().split('T')[0] : payload.date,
      tankName: newRecordData.tankName || 'Tank',
      status: 'Completed',
    };
    setMedicineRecords((prev) => [normalized, ...prev]);
    emitDataMutation('MEDICINE', 'CREATE', normalized);
    fetchMedicineRecords(true);
    return normalized;
  };

  const updateMedicineRecord = async (id, updatedData) => {
    const targetId = String(id);
    const payload = {
      ...(updatedData.medicineName ? { medicineName: updatedData.medicineName } : {}),
      ...(updatedData.purpose ? { purpose: updatedData.purpose } : {}),
      ...(updatedData.dosage !== undefined ? { dosage: String(updatedData.dosage) } : {}),
      ...(updatedData.quantity !== undefined ? { quantity: parseFloat(updatedData.quantity) } : {}),
      ...(updatedData.cost !== undefined ? { cost: parseFloat(updatedData.cost) } : {}),
      ...(updatedData.applicationDate || updatedData.date ? { date: updatedData.applicationDate || updatedData.date } : {}),
      ...(updatedData.notes !== undefined ? { notes: updatedData.notes } : {}),
    };

    const res = await medicineService.updateMedicine(targetId, payload);
    const updated = res.data || res;
    const normalized = {
      ...updated,
      id: targetId,
      applicationDate: updated.date ? new Date(updated.date).toISOString().split('T')[0] : updatedData.applicationDate,
      tankName: updated.tank?.tankName || 'Tank',
      status: 'Completed',
    };
    setMedicineRecords((prev) => prev.map((rec) => (String(rec.id) === targetId ? { ...rec, ...normalized } : rec)));
    emitDataMutation('MEDICINE', 'UPDATE', normalized);
    fetchMedicineRecords(true);
    return normalized;
  };

  const deleteMedicineRecord = async (id, password) => {
    if (!id) return;
    const targetId = String(id);
    await medicineService.deleteMedicine(targetId, password);
    setMedicineRecords((prev) => prev.filter((rec) => String(rec.id) !== targetId));
    emitDataMutation('MEDICINE', 'DELETE', { id: targetId });
    fetchMedicineRecords(true);
  };

  const getMedicineRecordById = (id) => {
    if (!id) return null;
    return medicineRecords.find((rec) => String(rec.id) === String(id));
  };

  // Analytics Computations
  const analytics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    const totalTreatments = medicineRecords.length;

    const medicinesUsedToday = medicineRecords.filter(
      (rec) => rec.applicationDate === todayStr
    ).length;

    const totalMedicineCostRupees = medicineRecords.reduce(
      (acc, rec) => acc + (parseFloat(rec.cost) || 0),
      0
    );

    const upcomingTreatments = medicineRecords.filter(
      (rec) => rec.applicationDate > todayStr
    ).length;

    const thisWeeksTreatments = medicineRecords.filter((rec) => {
      const recDate = new Date(rec.applicationDate);
      const today = new Date();
      const diffTime = Math.abs(today - recDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length;

    return {
      totalTreatments,
      medicinesUsedToday,
      totalMedicineCostRupees,
      upcomingTreatments,
      thisWeeksTreatments,
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
