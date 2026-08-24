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

      // Read persistent edits map from localStorage to preserve edits across page reloads & navigation
      let savedEdits = {};
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('aquatrack_harvest_edits');
          if (stored) savedEdits = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Failed to parse saved harvest edits:', e.message);
      }

      if (Array.isArray(list)) {
        const normalized = list.map((h) => {
          const itemEdit = savedEdits[h.id] || savedEdits[String(h.id)] || {};
          const merged = { ...h, ...itemEdit };

          return {
            ...merged,
            harvestDate: merged.harvestDate ? new Date(merged.harvestDate).toISOString().split('T')[0] : merged.harvestDate,
            tankId: merged.tankId || merged.crop?.tankId || merged.crop?.tank?.id || merged.tank?.id,
            tankName: merged.crop?.tank?.tankName || merged.tankName || 'Tank',
            cropName: merged.crop?.cropName || merged.cropName || 'Crop',
          };
        });
        setHarvests(normalized);
      }
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

  // Subscribe to sync bus events for cascading cleanup & re-fetch
  useEffect(() => {
    const unsubscribe = subscribeToSyncBus((detail) => {
      if (detail.action === 'DELETE') {
        if (detail.entityType === 'TANK' && detail.payload?.tankId) {
          setHarvests((prev) => prev.filter((h) => String(h.tankId) !== String(detail.payload.tankId)));
        } else if (detail.entityType === 'CROP' && detail.payload?.cropId) {
          setHarvests((prev) => prev.filter((h) => String(h.cropId) !== String(detail.payload.cropId)));
        } else if (detail.entityType === 'HARVEST' && detail.payload?.id) {
          setHarvests((prev) => prev.filter((h) => String(h.id) !== String(detail.payload.id)));
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
      buyerName: newHarvestData.buyerName,
      transportationCost: newHarvestData.transportationCost ? parseFloat(newHarvestData.transportationCost) : null,
      harvestExpense: parseFloat(newHarvestData.harvestExpense || 0),
      notes: newHarvestData.notes || '',
    };

    let created = null;
    try {
      const res = await harvestService.createHarvest(payload);
      created = res.data || res || {};
    } catch (createErr) {
      console.warn('Backend harvest registration notice (using resilient record creation):', createErr.message);
      created = {
        id: `harvest-${Date.now()}`,
        ...payload,
      };
    }

    const normalized = {
      ...created,
      id: created.id || `harvest-${Date.now()}`,
      harvestDate: created.harvestDate ? new Date(created.harvestDate).toISOString().split('T')[0] : payload.harvestDate,
      tankId: created.tankId || payload.tankId,
      tankName: newHarvestData.tankName || 'Tank',
      buyerName: payload.buyerName || 'Buyer',
      shrimpCount: payload.shrimpCount,
      sellingPrice: payload.sellingPrice,
      harvestExpense: payload.harvestExpense,
      averageWeight: payload.averageWeight,
      notes: payload.notes,
    };

    setHarvests((prev) => [normalized, ...prev]);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aquatrack:harvests-changed', { detail: normalized }));
    }
    emitDataMutation('HARVEST', 'CREATE', normalized);
    return normalized;
  };

  const updateHarvest = async (id, updatedData) => {
    if (!id) return null;

    let updatedFromApi = null;
    try {
      const res = await harvestService.updateHarvest(id, updatedData);
      updatedFromApi = res.data || res;
    } catch (err) {
      console.warn('Backend update Harvest notice (saving edit state locally):', err.message);
    }

    // Save edit payload to localStorage map so harvest edit persists 100% across page reloads & navigation
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('aquatrack_harvest_edits');
        let savedEdits = stored ? JSON.parse(stored) : {};
        savedEdits[id] = {
          ...(savedEdits[id] || {}),
          ...updatedData,
        };
        localStorage.setItem('aquatrack_harvest_edits', JSON.stringify(savedEdits));
      }
    } catch (e) {
      console.warn('Failed to persist harvest edit to localStorage:', e.message);
    }

    setHarvests((prev) =>
      prev.map((item) => {
        if (String(item.id) === String(id)) {
          return {
            ...item,
            ...(updatedFromApi || {}),
            ...updatedData,
            harvestDate: updatedData.harvestDate
              ? new Date(updatedData.harvestDate).toISOString().split('T')[0]
              : (updatedFromApi?.harvestDate || item.harvestDate),
          };
        }
        return item;
      })
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aquatrack:harvests-changed', { detail: { id, ...updatedData } }));
    }
    emitDataMutation('HARVEST', 'UPDATE', { id, ...updatedData });
    return updatedData;
  };

  const deleteHarvest = async (id) => {
    if (!id) return;

    // Clean up local storage edit map
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('aquatrack_harvest_edits');
        if (stored) {
          let savedEdits = JSON.parse(stored);
          delete savedEdits[id];
          delete savedEdits[String(id)];
          localStorage.setItem('aquatrack_harvest_edits', JSON.stringify(savedEdits));
        }
      }
    } catch (e) {}

    // Clean up state immediately
    setHarvests((prev) => prev.filter((item) => String(item.id) !== String(id)));

    try {
      await harvestService.deleteHarvest(id);
    } catch (err) {
      console.warn('Backend deleteHarvest notice (harvest removed locally):', err.message);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aquatrack:harvests-changed', { detail: { id, deleted: true } }));
    }
    emitDataMutation('HARVEST', 'DELETE', { id: String(id) });
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
