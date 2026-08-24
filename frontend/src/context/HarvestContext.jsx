import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import harvestService from '../services/harvestService';
import { useAuth } from './AuthContext';
import { emitDataMutation, subscribeToSyncBus } from '../utils/syncBus';

const HarvestContext = createContext(null);

export const HarvestProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [harvests, setHarvests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHarvests = useCallback(async (isSilent = false) => {
    if (!isAuthenticated) {
      setHarvests([]);
      return;
    }
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await harvestService.getHarvests();
      const list = res.data || res || [];
      const normalized = (Array.isArray(list) ? list : []).map((h) => ({
        ...h,
        id: String(h.id),
        harvestDate: h.harvestDate ? new Date(h.harvestDate).toISOString().split('T')[0] : h.harvestDate,
        tankName: h.crop?.tank?.tankName || h.crop?.tank?.name || h.tankName || 'Tank',
        cropName: h.crop?.cropName || h.cropName || 'Crop',
      }));
      setHarvests(normalized);
    } catch (err) {
      console.error('Error fetching harvests:', err);
      setError(err.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchHarvests();
  }, [fetchHarvests, token]);

  // Subscribe to sync bus events for cascading cleanup & re-fetching
  useEffect(() => {
    const unsubscribe = subscribeToSyncBus((detail) => {
      if (detail.action === 'DELETE') {
        if (detail.entityType === 'TANK' && detail.payload?.tankId) {
          setHarvests((prev) => prev.filter((h) => String(h.tankId) !== String(detail.payload.tankId)));
        } else if (detail.entityType === 'CROP' && detail.payload?.cropId) {
          setHarvests((prev) => prev.filter((h) => String(h.cropId) !== String(detail.payload.cropId)));
        }
        fetchHarvests(true);
      } else if (['SITE', 'TANK', 'CROP', 'HARVEST'].includes(detail.entityType)) {
        fetchHarvests(true);
      }
    });
    return unsubscribe;
  }, [fetchHarvests]);

  const addHarvest = async (newHarvestData) => {
    const payload = {
      tankId: newHarvestData.tankId,
      harvestDate: newHarvestData.harvestDate || new Date().toISOString().split('T')[0],
      shrimpCount: newHarvestData.shrimpCount ? parseFloat(newHarvestData.shrimpCount) : undefined,
      production: newHarvestData.production !== undefined && newHarvestData.production !== null ? parseFloat(newHarvestData.production) : (newHarvestData.shrimpCount ? parseFloat(newHarvestData.shrimpCount) : undefined),
      averageWeight: newHarvestData.averageWeight ? parseFloat(newHarvestData.averageWeight) : (newHarvestData.shrimpCount ? parseFloat((1000 / parseFloat(newHarvestData.shrimpCount)).toFixed(2)) : undefined),
      survivalRate: newHarvestData.survivalRate !== undefined ? parseFloat(newHarvestData.survivalRate) : 85,
      sellingPrice: parseFloat(newHarvestData.sellingPrice),
      buyerName: String(newHarvestData.buyerName).trim(),
      transportationCost: newHarvestData.transportationCost ? parseFloat(newHarvestData.transportationCost) : null,
      harvestExpense: parseFloat(newHarvestData.harvestExpense || 0),
      notes: newHarvestData.notes ? String(newHarvestData.notes).trim() : '',
    };

    const res = await harvestService.createHarvest(payload);
    const created = res.data || res;
    const normalized = {
      ...created,
      id: String(created.id),
      harvestDate: created.harvestDate ? new Date(created.harvestDate).toISOString().split('T')[0] : payload.harvestDate,
      tankName: newHarvestData.tankName || 'Tank',
    };
    setHarvests((prev) => [normalized, ...prev]);
    emitDataMutation('HARVEST', 'CREATE', normalized);
    fetchHarvests(true);
    return normalized;
  };

  const updateHarvest = async (id, updatedData) => {
    if (!id) return;
    const targetId = String(id);
    const payload = {
      ...(updatedData.tankId ? { tankId: String(updatedData.tankId) } : {}),
      ...(updatedData.harvestDate ? { harvestDate: String(updatedData.harvestDate) } : {}),
      ...(updatedData.shrimpCount ? { shrimpCount: parseFloat(updatedData.shrimpCount) } : {}),
      ...(updatedData.production ? { production: parseFloat(updatedData.production) } : {}),
      ...(updatedData.averageWeight ? { averageWeight: parseFloat(updatedData.averageWeight) } : {}),
      ...(updatedData.survivalRate !== undefined ? { survivalRate: parseFloat(updatedData.survivalRate) } : {}),
      ...(updatedData.sellingPrice ? { sellingPrice: parseFloat(updatedData.sellingPrice) } : {}),
      ...(updatedData.buyerName ? { buyerName: String(updatedData.buyerName).trim() } : {}),
      ...(updatedData.transportationCost !== undefined ? { transportationCost: updatedData.transportationCost ? parseFloat(updatedData.transportationCost) : null } : {}),
      ...(updatedData.harvestExpense !== undefined ? { harvestExpense: parseFloat(updatedData.harvestExpense) } : {}),
      ...(updatedData.notes !== undefined ? { notes: updatedData.notes ? String(updatedData.notes).trim() : '' } : {}),
    };

    const res = await harvestService.updateHarvest(targetId, payload);
    const updated = res.data || res;
    const normalized = {
      ...updated,
      id: targetId,
      harvestDate: updated.harvestDate ? new Date(updated.harvestDate).toISOString().split('T')[0] : updatedData.harvestDate,
      tankName: updated.crop?.tank?.tankName || updated.crop?.tank?.name || updatedData.tankName || 'Tank',
    };
    setHarvests((prev) => prev.map((item) => (String(item.id) === targetId ? { ...item, ...normalized } : item)));
    emitDataMutation('HARVEST', 'UPDATE', normalized);
    fetchHarvests(true);
    return normalized;
  };

  const deleteHarvest = async (id) => {
    if (!id) return;
    const targetId = String(id);
    try {
      await harvestService.deleteHarvest(targetId);
    } catch (err) {
      console.warn('Backend harvest delete notice:', err.message);
    }
    setHarvests((prev) => prev.filter((item) => String(item.id) !== targetId));
    emitDataMutation('HARVEST', 'DELETE', { id: targetId });
    fetchHarvests(true);
  };

  const getHarvestById = (id) => {
    return harvests.find((item) => String(item.id) === String(id));
  };

  return (
    <HarvestContext.Provider
      value={{
        harvests,
        loading,
        error,
        fetchHarvests,
        addHarvest,
        updateHarvest,
        deleteHarvest,
        getHarvestById,
      }}
    >
      {children}
    </HarvestContext.Provider>
  );
};

export const useHarvests = () => {
  const context = useContext(HarvestContext);
  if (!context) {
    throw new Error('useHarvests must be used within a HarvestProvider');
  }
  return context;
};

export default HarvestContext;
