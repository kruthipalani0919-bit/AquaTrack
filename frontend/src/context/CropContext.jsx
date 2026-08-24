import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cropService from '../services/cropService';
import harvestService from '../services/harvestService';
import { useAuth } from './AuthContext';
import { emitDataMutation, subscribeToSyncBus } from '../utils/syncBus';

const CropContext = createContext(null);

export const CropProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCrops = useCallback(async (isSilent = false) => {
    if (!isAuthenticated) {
      setCrops([]);
      return;
    }
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const [cropsRes, harvestsRes] = await Promise.all([
        cropService.getCrops().catch(() => ({ data: [] })),
        harvestService.getHarvests().catch(() => ({ data: [] })),
      ]);

      const cropList = cropsRes.data || cropsRes || [];
      const harvestList = harvestsRes.data || harvestsRes || [];

      if (!Array.isArray(cropList)) {
        setCrops([]);
        return;
      }

      // Set of crop IDs and tank IDs that have an existing harvest record
      const harvestedCropIds = new Set(
        harvestList.map((h) => h.cropId || h.crop?.id).filter(Boolean)
      );
      const harvestedTankIds = new Set(
        harvestList.map((h) => h.tankId || h.tank?.id || h.crop?.tankId).filter(Boolean)
      );

      const normalized = cropList.map((c) => {
        const hasHarvest = harvestedCropIds.has(c.id) || harvestedTankIds.has(c.tankId);
        const derivedStatus = hasHarvest ? 'COMPLETED' : (c.status || 'ACTIVE');

        return {
          ...c,
          cropName: c.cropName || c.batchNumber || (c.seedVariety ? `${c.seedVariety} (${c.batchNumber || 'Batch'})` : 'Crop Batch'),
          batchNumber: c.batchNumber || c.cropName || '',
          expectedProductionKg: c.expectedProductionKg ?? c.expectedProduction,
          expectedSellingPricePerKg: c.expectedSellingPricePerKg ?? c.expectedSellingPrice,
          tankName: c.tank?.tankName || c.tankName || 'Tank',
          status: derivedStatus === 'ACTIVE' ? 'Active' : 'Completed',
          rawStatus: derivedStatus,
        };
      });

      setCrops(normalized);
    } catch (err) {
      console.error('Error fetching crops:', err);
      setError(err.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCrops();

    const handleHarvestsChanged = () => {
      fetchCrops(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('aquatrack:harvests-changed', handleHarvestsChanged);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('aquatrack:harvests-changed', handleHarvestsChanged);
      }
    };
  }, [fetchCrops, token]);

  // Subscribe to sync bus events for cascading crop cleanup
  useEffect(() => {
    const unsubscribe = subscribeToSyncBus((detail) => {
      if (detail.action === 'DELETE') {
        if (detail.entityType === 'TANK' && detail.payload?.tankId) {
          setCrops((prev) => prev.filter((c) => String(c.tankId) !== String(detail.payload.tankId)));
        } else if (detail.entityType === 'CROP' && detail.payload?.cropId) {
          setCrops((prev) => prev.filter((c) => String(c.id) !== String(detail.payload.cropId)));
        }
        fetchCrops(true);
      } else if (detail.entityType === 'SITE' || detail.entityType === 'TANK' || detail.entityType === 'CROP') {
        fetchCrops(true);
      }
    });
    return unsubscribe;
  }, [fetchCrops]);

  const addCrop = async (newCropData) => {
    const payload = {
      tankId: newCropData.tankId,
      stockingDate: newCropData.stockingDate,
      seedVariety: newCropData.seedVariety,
      batchNumber: newCropData.batchNumber || newCropData.cropName,
      ...(newCropData.notes ? { notes: newCropData.notes } : {}),
    };

    const res = await cropService.createCrop(payload);
    const created = res.data || res;
    const normalized = {
      ...created,
      cropName: created.cropName || created.batchNumber || newCropData.batchNumber,
      batchNumber: created.batchNumber || newCropData.batchNumber,
      tankName: newCropData.tankName || created.tank?.tankName || 'Tank',
      status: 'Active',
      rawStatus: 'ACTIVE',
    };
    setCrops((prev) => [normalized, ...prev]);
    emitDataMutation('CROP', 'CREATE', normalized);
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
      rawStatus: updated.status,
    };
    setCrops((prev) => prev.map((crop) => (String(crop.id) === String(id) ? { ...crop, ...normalized } : crop)));
    emitDataMutation('CROP', 'UPDATE', normalized);
    return normalized;
  };

  const completeCrop = async (id) => {
    const res = await cropService.completeCrop(id);
    const updated = res.data || res;
    setCrops((prev) =>
      prev.map((crop) =>
        String(crop.id) === String(id)
          ? {
              ...crop,
              ...updated,
              status: 'Completed',
              rawStatus: 'COMPLETED',
            }
          : crop
      )
    );
    emitDataMutation('CROP', 'UPDATE', updated);
    return updated;
  };

  const deleteCrop = async (id) => {
    if (!id) return;
    const targetCrop = crops.find((c) => String(c.id) === String(id));
    const tankId = targetCrop?.tankId;

    try {
      await cropService.deleteCrop(id);
    } catch (apiErr) {
      console.warn('Backend delete notice (removing local crop state directly):', apiErr.message);
    }
    setCrops((prev) => prev.filter((crop) => String(crop.id) !== String(id)));
    emitDataMutation('CROP', 'DELETE', { cropId: String(id), id: String(id), tankId });
  };

  const getCropById = (id) => {
    return crops.find((crop) => String(crop.id) === String(id));
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
