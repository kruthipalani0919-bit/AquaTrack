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
        cropName: c.cropName || c.batchNumber || (c.seedVariety ? `${c.seedVariety} (${c.batchNumber || 'Batch'})` : 'Crop Batch'),
        batchNumber: c.batchNumber || c.cropName || '',
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
    const payload = {
      tankId: newCropData.tankId,
      stockingDate: newCropData.stockingDate,
      seedVariety: newCropData.seedVariety,
      batchNumber: newCropData.batchNumber || newCropData.cropName,
      ...(newCropData.notes ? { notes: newCropData.notes } : {}),
    };

    console.log('Sending Crop Payload to POST /api/crops:', payload);

    const res = await cropService.createCrop(payload);
    const created = res.data || res;
    const normalized = {
      ...created,
      cropName: created.cropName || created.batchNumber || newCropData.batchNumber,
      batchNumber: created.batchNumber || newCropData.batchNumber,
      tankName: newCropData.tankName || created.tank?.tankName || 'Tank',
      status: created.status === 'ACTIVE' ? 'Active' : created.status,
    };
    setCrops((prev) => [normalized, ...prev]);
    return normalized;
  };

  const updateCrop = async (id, updatedData) => {
    const payload = {
      ...(updatedData.tankId ? { tankId: updatedData.tankId } : {}),
      ...(updatedData.stockingDate ? { stockingDate: updatedData.stockingDate } : {}),
      ...(updatedData.seedVariety ? { seedVariety: updatedData.seedVariety } : {}),
      ...(updatedData.batchNumber || updatedData.cropName ? { batchNumber: updatedData.batchNumber || updatedData.cropName } : {}),
      ...(updatedData.notes !== undefined ? { notes: updatedData.notes } : {}),
    };

    const res = await cropService.updateCrop(id, payload);
    const updated = res.data || res;
    const normalized = {
      ...updated,
      cropName: updated.cropName || updated.batchNumber || updatedData.batchNumber,
      batchNumber: updated.batchNumber || updatedData.batchNumber,
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
        crop.id === id
          ? {
              ...crop,
              ...updated,
              status: 'Completed',
            }
          : crop
      )
    );
    return updated;
  };

  const deleteCrop = async (id) => {
    await cropService.deleteCrop(id);
    setCrops((prev) => prev.filter((crop) => crop.id !== id));
  };

  const getCropById = (id) => {
    return crops.find((crop) => crop.id === id);
  };

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
