import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import cropService from '../services/cropService';
import { useAuth } from './AuthContext';

const CropContext = createContext(null);

export const CropProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCrops = useCallback(async () => {
    if (!isAuthenticated) {
      setCrops([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await cropService.getCrops();
      const cropList = res.data || res || [];
      const normalized = cropList.map((c) => ({
        ...c,
        expectedProductionKg: c.expectedProductionKg ?? c.expectedProduction,
        expectedSellingPricePerKg: c.expectedSellingPricePerKg ?? c.expectedSellingPrice,
        tankName: c.tank?.tankName || c.tankName || 'Tank',
        status: c.status === 'ACTIVE' ? 'Active' : c.status === 'COMPLETED' ? 'Completed' : c.status,
      }));
      setCrops(normalized);
    } catch (err) {
      console.error('Error fetching crops:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops, token]);

  const addCrop = async (newCropData) => {
    const stockingDate = new Date(newCropData.stockingDate);
    const expectedHarvestDate = new Date(newCropData.expectedHarvestDate);
    const diffTime = Math.abs(expectedHarvestDate - stockingDate);
    const cropDurationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 120;

    const payload = {
      tankId: newCropData.tankId,
      cropName: newCropData.cropName,
      seedVariety: newCropData.seedVariety,
      plCount: parseInt(newCropData.plCount, 10),
      stockingDate: newCropData.stockingDate,
      expectedHarvestDate: newCropData.expectedHarvestDate,
      cropDuration: parseFloat(newCropData.cropDuration || cropDurationDays),
      expectedProduction: parseFloat(newCropData.expectedProductionKg || newCropData.expectedProduction),
      expectedSellingPrice: parseFloat(newCropData.expectedSellingPricePerKg || newCropData.expectedSellingPrice),
      notes: newCropData.notes || undefined,
    };

    const res = await cropService.createCrop(payload);
    const created = res.data || res;
    const normalized = {
      ...created,
      expectedProductionKg: created.expectedProductionKg ?? created.expectedProduction,
      expectedSellingPricePerKg: created.expectedSellingPricePerKg ?? created.expectedSellingPrice,
      tankName: newCropData.tankName || created.tank?.tankName || 'Tank',
      status: created.status === 'ACTIVE' ? 'Active' : created.status,
    };
    setCrops((prev) => [normalized, ...prev]);
    return normalized;
  };

  const updateCrop = async (id, updatedData) => {
    const payload = {
      ...(updatedData.tankId ? { tankId: updatedData.tankId } : {}),
      ...(updatedData.cropName ? { cropName: updatedData.cropName } : {}),
      ...(updatedData.seedVariety ? { seedVariety: updatedData.seedVariety } : {}),
      ...(updatedData.plCount ? { plCount: parseInt(updatedData.plCount, 10) } : {}),
      ...(updatedData.stockingDate ? { stockingDate: updatedData.stockingDate } : {}),
      ...(updatedData.expectedHarvestDate ? { expectedHarvestDate: updatedData.expectedHarvestDate } : {}),
      ...(updatedData.cropDuration ? { cropDuration: parseFloat(updatedData.cropDuration) } : {}),
      ...(updatedData.expectedProductionKg || updatedData.expectedProduction
        ? { expectedProduction: parseFloat(updatedData.expectedProductionKg || updatedData.expectedProduction) }
        : {}),
      ...(updatedData.expectedSellingPricePerKg || updatedData.expectedSellingPrice
        ? { expectedSellingPrice: parseFloat(updatedData.expectedSellingPricePerKg || updatedData.expectedSellingPrice) }
        : {}),
      ...(updatedData.notes !== undefined ? { notes: updatedData.notes } : {}),
    };

    const res = await cropService.updateCrop(id, payload);
    const updated = res.data || res;
    const normalized = {
      ...updated,
      expectedProductionKg: updated.expectedProductionKg ?? updated.expectedProduction,
      expectedSellingPricePerKg: updated.expectedSellingPricePerKg ?? updated.expectedSellingPrice,
      tankName: updated.tank?.tankName || 'Tank',
      status: updated.status === 'ACTIVE' ? 'Active' : updated.status === 'COMPLETED' ? 'Completed' : updated.status,
    };
    setCrops((prev) => prev.map((crop) => (crop.id === id ? { ...crop, ...normalized } : crop)));
    return normalized;
  };

  const completeCrop = async (id) => {
    const res = await cropService.completeCrop(id);
    const updated = res.data || res;
    setCrops((prev) =>
      prev.map((crop) =>
        crop.id === id ? { ...crop, status: 'Completed', ...updated } : crop
      )
    );
  };

  const deleteCrop = async (id) => {
    await cropService.deleteCrop(id);
    setCrops((prev) => prev.filter((crop) => crop.id !== id));
  };

  const getCropById = (id) => {
    return crops.find((crop) => crop.id === id);
  };

  // Summary Metrics Computation
  const summaryMetrics = useMemo(() => {
    const activeCrops = crops.filter((c) => c.status === 'Active' || c.status === 'ACTIVE');
    const activeCropsCount = activeCrops.length;

    const totalPlStocked = crops.reduce((acc, c) => acc + (parseInt(c.plCount, 10) || 0), 0);

    const expectedHarvestKg = crops.reduce(
      (acc, c) => acc + (parseFloat(c.expectedProductionKg || c.expectedProduction) || 0),
      0
    );

    const estimatedRevenueRupees = crops.reduce((acc, c) => {
      const prod = parseFloat(c.expectedProductionKg || c.expectedProduction) || 0;
      const price = parseFloat(c.expectedSellingPricePerKg || c.expectedSellingPrice) || 0;
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
        loading,
        error,
        fetchCrops,
        addCrop,
        updateCrop,
        completeCrop,
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
