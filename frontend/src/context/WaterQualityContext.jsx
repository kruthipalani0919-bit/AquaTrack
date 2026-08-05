import React, { createContext, useContext, useState, useMemo } from 'react';
import { MOCK_WATER_RECORDS } from '../constants/waterQualityData';

const WaterQualityContext = createContext(null);

/**
 * Automatic Status Calculation Engine based on safe parameter bounds.
 */
export const calculateWaterStatus = (record) => {
  const ph = parseFloat(record.ph) || 0;
  const doVal = parseFloat(record.dissolvedOxygen) || 0;
  const temp = parseFloat(record.temperature) || 0;
  const ammonia = parseFloat(record.ammonia) || 0;
  const nitrite = parseFloat(record.nitrite) || 0;

  // 1. Critical Threshold Breaches (Immediate danger)
  if (
    doVal < 3.5 ||
    ammonia > 0.50 ||
    ph < 7.0 ||
    ph > 9.0 ||
    temp < 24.0 ||
    temp > 33.0
  ) {
    return 'Critical';
  }

  // 2. Warning Threshold Breaches (Sub-optimal)
  if (
    doVal < 5.0 ||
    ammonia > 0.10 ||
    nitrite > 0.20 ||
    ph < 7.5 ||
    ph > 8.5 ||
    temp < 26.0 ||
    temp > 31.0
  ) {
    return 'Warning';
  }

  // 3. Optimal Range
  return 'Normal';
};

export const WaterQualityProvider = ({ children }) => {
  const [waterRecords, setWaterRecords] = useState(MOCK_WATER_RECORDS);

  const addWaterRecord = (newRecordData) => {
    const computedStatus = calculateWaterStatus(newRecordData);

    const newRecord = {
      id: `water-${Date.now()}`,
      tankId: newRecordData.tankId,
      tankName: newRecordData.tankName || 'Selected Tank',
      testDate: newRecordData.testDate,
      testTime: newRecordData.testTime,
      ph: parseFloat(newRecordData.ph),
      temperature: parseFloat(newRecordData.temperature),
      dissolvedOxygen: parseFloat(newRecordData.dissolvedOxygen),
      salinity: parseFloat(newRecordData.salinity),
      ammonia: parseFloat(newRecordData.ammonia),
      nitrite: parseFloat(newRecordData.nitrite),
      alkalinity: parseFloat(newRecordData.alkalinity),
      waterLevel: parseFloat(newRecordData.waterLevel),
      status: computedStatus,
      notes: newRecordData.notes || '',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setWaterRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const updateWaterRecord = (id, updatedData) => {
    const computedStatus = calculateWaterStatus(updatedData);

    setWaterRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === id) {
          return {
            ...rec,

            ...updatedData,
            ph: parseFloat(updatedData.ph),
            temperature: parseFloat(updatedData.temperature),
            dissolvedOxygen: parseFloat(updatedData.dissolvedOxygen),
            salinity: parseFloat(updatedData.salinity),
            ammonia: parseFloat(updatedData.ammonia),
            nitrite: parseFloat(updatedData.nitrite),
            alkalinity: parseFloat(updatedData.alkalinity),
            waterLevel: parseFloat(updatedData.waterLevel),
            status: computedStatus,
          };
        }
        return rec;
      })
    );
  };

  const deleteWaterRecord = (id) => {
    setWaterRecords((prev) => prev.filter((rec) => rec.id !== id));
  };

  const getWaterRecordById = (id) => {
    return waterRecords.find((rec) => rec.id === id);
  };

  // 5 Top Summary Cards Metrics Computation (Requirement 1)
  const summaryMetrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const totalCount = waterRecords.length || 1;

    // 1. Today's Water Check count
    const todaysWaterChecks = waterRecords.filter((rec) => rec.testDate === todayStr).length;

    // 2. Average pH
    const totalPh = waterRecords.reduce((acc, rec) => acc + (parseFloat(rec.ph) || 0), 0);
    const avgPh = (totalPh / totalCount).toFixed(1);

    // 3. Average Temperature (°C)
    const totalTemp = waterRecords.reduce((acc, rec) => acc + (parseFloat(rec.temperature) || 0), 0);
    const avgTemperature = (totalTemp / totalCount).toFixed(1);

    // 4. Average Dissolved Oxygen (mg/L)
    const totalDo = waterRecords.reduce((acc, rec) => acc + (parseFloat(rec.dissolvedOxygen) || 0), 0);
    const avgDissolvedOxygen = (totalDo / totalCount).toFixed(1);

    // 5. Active Alerts Count (Warning / Critical)
    const activeAlerts = waterRecords.filter(
      (rec) => rec.status === 'Warning' || rec.status === 'Critical'
    ).length;

    return {
      todaysWaterChecks,
      avgPh,
      avgTemperature,
      avgDissolvedOxygen,
      activeAlerts,
    };
  }, [waterRecords]);

  return (
    <WaterQualityContext.Provider
      value={{
        waterRecords,
        addWaterRecord,
        updateWaterRecord,
        deleteWaterRecord,
        getWaterRecordById,
        summaryMetrics,
      }}
    >
      {children}
    </WaterQualityContext.Provider>
  );
};

export const useWaterQuality = () => {
  const context = useContext(WaterQualityContext);
  if (!context) {
    throw new Error('useWaterQuality must be used within a WaterQualityProvider');
  }
  return context;
};

export default WaterQualityContext;
