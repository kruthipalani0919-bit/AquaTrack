import React, { createContext, useContext, useState, useMemo } from 'react';
import { MOCK_MEDICINE_RECORDS } from '../constants/medicineData';

const MedicineContext = createContext(null);

export const MedicineProvider = ({ children }) => {
  const [medicineRecords, setMedicineRecords] = useState(MOCK_MEDICINE_RECORDS);

  const addMedicineRecord = (newRecordData) => {
    const newRecord = {
      id: `med-${Date.now()}`,
      cropId: newRecordData.cropId,
      cropName: newRecordData.cropName || 'Selected Crop',
      tankId: newRecordData.tankId || 'tank-1',
      tankName: newRecordData.tankName || 'Selected Tank',
      medicineName: newRecordData.medicineName,
      category: newRecordData.category,
      dosage: parseFloat(newRecordData.dosage),
      unit: newRecordData.unit,
      applicationDate: newRecordData.applicationDate,
      applicationTime: newRecordData.applicationTime,
      cost: parseFloat(newRecordData.cost || 0),
      purpose: newRecordData.purpose || '',
      status: newRecordData.status || 'Completed',
      notes: newRecordData.notes || '',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setMedicineRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const updateMedicineRecord = (id, updatedData) => {
    setMedicineRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === id) {
          return {
            ...rec,

            ...updatedData,
            dosage: parseFloat(updatedData.dosage),
            cost: parseFloat(updatedData.cost || 0),
          };
        }
        return rec;
      })
    );
  };

  const deleteMedicineRecord = (id) => {
    setMedicineRecords((prev) => prev.filter((rec) => rec.id !== id));
  };

  const getMedicineRecordById = (id) => {
    return medicineRecords.find((rec) => rec.id === id);
  };

  // Analytics Computations (Requirement 1 & Requirement 8)
  const analytics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Total Treatments
    const totalTreatments = medicineRecords.length;

    // 2. Medicines Used Today (Completed today)
    const medicinesUsedToday = medicineRecords.filter(
      (rec) => rec.applicationDate === todayStr && rec.status === 'Completed'
    ).length;

    // 3. Total Medicine Cost (₹)
    const totalMedicineCostRupees = medicineRecords.reduce(
      (acc, rec) => acc + (parseFloat(rec.cost) || 0),
      0
    );

    // 4. Upcoming Treatments
    const upcomingTreatments = medicineRecords.filter(
      (rec) => rec.status === 'Scheduled' || rec.applicationDate > todayStr
    ).length;

    // 5. This Week's Treatments
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
