import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cropService from '../services/cropService';
import harvestService from '../services/harvestService';
import tankService from '../services/tankService';
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
      const [cropsRes, harvestsRes, tanksRes] = await Promise.all([
        cropService.getCrops().catch(() => ({ data: [] })),
        harvestService.getHarvests().catch(() => ({ data: [] })),
        tankService.getTanks().catch(() => ({ data: [] })),
      ]);

      const cropList = cropsRes.data || cropsRes || [];
      const harvestList = harvestsRes.data || harvestsRes || [];
      const tankList = tanksRes.data || tanksRes || [];

      if (!Array.isArray(cropList)) {
        setCrops([]);
        return;
      }

      // Map tanks by unique ID for instant relationship resolution
      const tanksMap = new Map();
      if (Array.isArray(tankList)) {
        tankList.forEach((t) => {
          if (t && t.id) {
            tanksMap.set(String(t.id), t.tankName || t.name || 'Tank');
          }
        });
      }

      // Set of crop IDs and tank IDs that have an existing harvest record
      const harvestedCropIds = new Set(
        harvestList.map((h) => h.cropId || h.crop?.id).filter(Boolean)
      );
      const harvestedTankIds = new Set(
        harvestList.map((h) => h.tankId || h.tank?.id || h.crop?.tankId).filter(Boolean)
      );

      const normalized = cropList.map((c) => {
        const cropTankId = c.tankId || c.tank?.id;
        const matchingTankName = cropTankId ? tanksMap.get(String(cropTankId)) : null;
        const resolvedTankName = matchingTankName
          || c.tank?.tankName
          || c.tank?.name
          || c.tankName
          || (cropTankId ? 'Tank' : 'No Tank Assigned');

        const hasHarvest = (c.id && harvestedCropIds.has(c.id)) || (cropTankId && harvestedTankIds.has(cropTankId));
        const derivedStatus = hasHarvest ? 'COMPLETED' : (c.status || 'ACTIVE');

        return {
          ...c,
          id: String(c.id),
          cropName: c.cropName || c.batchNumber || (c.seedVariety ? `${c.seedVariety} (${c.batchNumber || 'Batch'})` : 'Crop Batch'),
          batchNumber: c.batchNumber || c.cropName || '',
          expectedProductionKg: c.expectedProductionKg ?? c.expectedProduction,
          expectedSellingPricePerKg: c.expectedSellingPricePerKg ?? c.expectedSellingPrice,
          tankName: resolvedTankName,
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

  // Subscribe to sync bus events for cascading crop cleanup & reactive tank updates
  useEffect(() => {
    const unsubscribe = subscribeToSyncBus((detail) => {
      if (detail.action === 'DELETE') {
        if (detail.entityType === 'TANK' && detail.payload?.tankId) {
          setCrops((prev) => prev.filter((c) => String(c.tankId) !== String(detail.payload.tankId)));
        } else if (detail.entityType === 'CROP' && detail.payload?.cropId) {
          setCrops((prev) => prev.filter((c) => String(c.id) !== String(detail.payload.cropId)));
        }
        fetchCrops(true);
      } else if (['SITE', 'TANK', 'CROP', 'HARVEST'].includes(detail.entityType)) {
        fetchCrops(true);
      }
    });
    return unsubscribe;
  }, [fetchCrops]);

  const addCrop = async (newCropData) => {
    const payload = {
      tankId: newCropData.tankId,
      stockingDate: newCropData.stockingDate,
      seedQuantity: newCropData.seedQuantity,
      seedVariety: newCropData.seedVariety,
      batchNumber: newCropData.batchNumber || newCropData.cropName,
      ...(newCropData.notes ? { notes: newCropData.notes } : {}),
    };

    const res = await cropService.createCrop(payload);
    const created = res.data || res;

    // Background fetch to resolve tank name and relationships cleanly
    fetchCrops(true);

    const normalized = {
      ...created,
      id: String(created.id),
      seedQuantity: created.seedQuantity ?? newCropData.seedQuantity,
      cropName: created.cropName || created.batchNumber || newCropData.batchNumber,
      batchNumber: created.batchNumber || newCropData.batchNumber,
      tankName: newCropData.tankName || created.tank?.tankName || created.tank?.name || 'Tank',
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
      ...(updatedData.seedQuantity !== undefined ? { seedQuantity: updatedData.seedQuantity } : {}),
      ...(updatedData.seedVariety ? { seedVariety: updatedData.seedVariety } : {}),
      ...(updatedData.batchNumber || updatedData.cropName ? { batchNumber: updatedData.batchNumber || updatedData.cropName } : {}),
      ...(updatedData.notes !== undefined ? { notes: updatedData.notes } : {}),
    };

    const res = await cropService.updateCrop(id, payload);
    const updated = res.data || res;

    fetchCrops(true);

    const normalized = {
      ...updated,
      id: String(id),
      cropName: updated.cropName || updated.batchNumber || updatedData.batchNumber,
      batchNumber: updated.batchNumber || updatedData.batchNumber,
      tankName: updatedData.tankName || updated.tank?.tankName || updated.tank?.name || 'Tank',
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
    fetchCrops(true);
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
    const targetId = String(id);
    const targetCrop = crops.find((c) => String(c.id) === targetId);
    const tankId = targetCrop?.tankId;

    try {
      await cropService.deleteCrop(targetId);
    } catch (apiErr) {
      console.warn('Backend delete notice (removing local crop state directly):', apiErr.message);
    }
    setCrops((prev) => prev.filter((crop) => String(crop.id) !== targetId));
    emitDataMutation('CROP', 'DELETE', { cropId: targetId, id: targetId, tankId });
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
