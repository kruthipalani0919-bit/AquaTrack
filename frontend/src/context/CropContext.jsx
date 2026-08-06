import React, { createContext, useContext, useState, useMemo } from 'react';
import { MOCK_CROPS } from '../constants/cropData';

const CropContext = createContext(null);

export const CropProvider = ({ children }) => {
  const [crops, setCrops] = useState(MOCK_CROPS);

  const addCrop = (newCropData) => {
    const newCrop = {
      id: `crop-${Date.now()}`,
      tankId: newCropData.tankId,
      tankName: newCropData.tankName || 'Selected Tank',
      cropName: newCropData.cropName,
      seedVariety: newCropData.seedVariety,
      plCount: parseInt(newCropData.plCount, 10),
      stockingDate: newCropData.stockingDate,
      expectedHarvestDate: newCropData.expectedHarvestDate,
      expectedProductionKg: parseFloat(newCropData.expectedProductionKg),
      expectedSellingPricePerKg: parseFloat(newCropData.expectedSellingPricePerKg),
      status: newCropData.status || 'Active',
      notes: newCropData.notes || '',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCrops((prev) => [newCrop, ...prev]);
    return newCrop;
  };

  const updateCrop = (id, updatedData) => {
    setCrops((prev) =>
      prev.map((crop) => {
        if (crop.id === id) {
          return {
            ...crop,

            ...updatedData,
            plCount: parseInt(updatedData.plCount, 10),
            expectedProductionKg: parseFloat(updatedData.expectedProductionKg),
            expectedSellingPricePerKg: parseFloat(updatedData.expectedSellingPricePerKg),
          };
        }
        return crop;
      })
    );
  };

  const deleteCrop = (id) => {
    setCrops((prev) => prev.filter((crop) => crop.id !== id));
  };

  const getCropById = (id) => {
    return crops.find((crop) => crop.id === id);
  };

  // Dashboard & Summary Cards Metrics
  const summaryMetrics = useMemo(() => {
    const activeCrops = crops.filter((c) => c.status === 'Active');
    const activeCropsCount = activeCrops.length;

    const totalPlStocked = crops.reduce((acc, c) => acc + (parseInt(c.plCount, 10) || 0), 0);

    const expectedHarvestKg = crops.reduce(
      (acc, c) => acc + (parseFloat(c.expectedProductionKg) || 0),
      0
    );

    const estimatedRevenueRupees = crops.reduce((acc, c) => {
      const prod = parseFloat(c.expectedProductionKg) || 0;
      const price = parseFloat(c.expectedSellingPricePerKg) || 0;
      return acc + prod * price;
    }, 0);

    return {
      activeCropsCount,
      totalPlStocked,
      expectedHarvestKg,
      estimatedRevenueRupees,
    };
  }, [crops]);

  return (
    <CropContext.Provider
      value={{
        crops,
        addCrop,
        updateCrop,
        deleteCrop,
        getCropById,
        summaryMetrics,
      }}
    >
      {children}
    </CropContext.Provider>
  );
};

export const useCrops = () => {
  const context = useContext(CropContext);
  if (!context) {
    throw new Error('useCrops must be used within a CropProvider');
  }
  return context;
};

export default CropContext;
