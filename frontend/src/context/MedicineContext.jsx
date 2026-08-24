import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import medicineService from '../services/medicineService';
import { useAuth } from './AuthContext';
import { useStocking } from './StockingContext';

const MedicineContext = createContext(null);

export const MedicineProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const { fetchStockings } = useStocking();
  const [medicineRecords, setMedicineRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMedicineRecords = useCallback(async () => {
    if (!isAuthenticated) {
      setMedicineRecords([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await medicineService.getMedicines();
      const list = res.data || res || [];
      const normalized = list.map((rec) => ({
        ...rec,
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
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchMedicineRecords();
  }, [fetchMedicineRecords, token]);

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
      applicationDate: created.date ? new Date(created.date).toISOString().split('T')[0] : payload.date,
      tankName: newRecordData.tankName || 'Tank',
      status: 'Completed',
    };
    setMedicineRecords((prev) => [normalized, ...prev]);

    if (fetchStockings) {
      try {
        await fetchStockings();
      } catch (err) {
        console.error('Error refreshing stock data after medicine addition:', err);
      }
    }

    return normalized;
  };

  const updateMedicineRecord = async (id, updatedData) => {
    const payload = {
      ...(updatedData.medicineName ? { medicineName: updatedData.medicineName } : {}),
      ...(updatedData.purpose ? { purpose: updatedData.purpose } : {}),
      ...(updatedData.dosage !== undefined ? { dosage: String(updatedData.dosage) } : {}),
      ...(updatedData.quantity !== undefined ? { quantity: parseFloat(updatedData.quantity) } : {}),
      ...(updatedData.cost !== undefined ? { cost: parseFloat(updatedData.cost) } : {}),
      ...(updatedData.applicationDate || updatedData.date ? { date: updatedData.applicationDate || updatedData.date } : {}),
      ...(updatedData.notes !== undefined ? { notes: updatedData.notes } : {}),
    };

    const res = await medicineService.updateMedicine(id, payload);
    const updated = res.data || res;
    const normalized = {
      ...updated,
      applicationDate: updated.date ? new Date(updated.date).toISOString().split('T')[0] : updatedData.applicationDate,
      tankName: updated.tank?.tankName || 'Tank',
      status: 'Completed',
    };
    setMedicineRecords((prev) => prev.map((rec) => (rec.id === id ? { ...rec, ...normalized } : rec)));

    if (fetchStockings) {
      try {
        await fetchStockings();
      } catch (err) {
        console.error('Error refreshing stock data after medicine update:', err);
      }
    }

    return normalized;
  };

  const deleteMedicineRecord = async (id) => {
    await medicineService.deleteMedicine(id);
    setMedicineRecords((prev) => prev.filter((rec) => rec.id !== id));

    if (fetchStockings) {
      try {
        await fetchStockings();
      } catch (err) {
        console.error('Error refreshing stock data after medicine deletion:', err);
      }
    }
  };

  const getMedicineRecordById = (id) => {
    return medicineRecords.find((rec) => rec.id === id);
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
