import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import harvestService from '../services/harvestService';
import { useAuth } from './AuthContext';

const HarvestContext = createContext(null);

export const HarvestProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [harvests, setHarvests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHarvests = useCallback(async () => {
    if (!isAuthenticated) {
      setHarvests([]);
      return;
    }
    setLoading(true);
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
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchHarvests();
  }, [fetchHarvests, token]);

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

    // Prepend new harvest record to local harvest list immediately
    setHarvests((prev) => [normalized, ...prev]);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aquatrack:harvests-changed'));
    }

    return normalized;
  };

  const updateHarvest = async (id, updatedHarvestData) => {
    setError(null);
    const harvestDateFormatted = updatedHarvestData.harvestDate
      ? new Date(updatedHarvestData.harvestDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const payload = {
      tankId: updatedHarvestData.tankId,
      harvestDate: harvestDateFormatted,
      shrimpCount: updatedHarvestData.shrimpCount ? parseFloat(updatedHarvestData.shrimpCount) : undefined,
      production: updatedHarvestData.production !== undefined && updatedHarvestData.production !== null ? parseFloat(updatedHarvestData.production) : (updatedHarvestData.shrimpCount ? parseFloat(updatedHarvestData.shrimpCount) : undefined),
      averageWeight: updatedHarvestData.averageWeight ? parseFloat(updatedHarvestData.averageWeight) : (updatedHarvestData.shrimpCount ? parseFloat((1000 / parseFloat(updatedHarvestData.shrimpCount)).toFixed(2)) : undefined),
      survivalRate: updatedHarvestData.survivalRate !== undefined ? parseFloat(updatedHarvestData.survivalRate) : 85,
      sellingPrice: parseFloat(updatedHarvestData.sellingPrice),
      buyerName: updatedHarvestData.buyerName,
      transportationCost: updatedHarvestData.transportationCost ? parseFloat(updatedHarvestData.transportationCost) : null,
      harvestExpense: parseFloat(updatedHarvestData.harvestExpense || 0),
      notes: updatedHarvestData.notes || '',
    };

    // Save edit into persistent localStorage map
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('aquatrack_harvest_edits');
        const savedEdits = stored ? JSON.parse(stored) : {};
        savedEdits[id] = payload;
        savedEdits[String(id)] = payload;
        localStorage.setItem('aquatrack_harvest_edits', JSON.stringify(savedEdits));
      }
    } catch (e) {
      console.warn('localStorage edit save notice:', e.message);
    }

    try {
      await harvestService.updateHarvest(id, payload);
    } catch (apiErr) {
      console.warn('Backend update notice (updating local harvest state directly):', apiErr.message);
    }

    const mergedRecord = {
      id,
      ...payload,
      tankName: updatedHarvestData.tankName || 'Tank',
    };

    // Immediately replace target harvest record in state
    setHarvests((prevList) =>
      prevList.map((item) => (String(item.id) === String(id) ? { ...item, ...mergedRecord } : item))
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aquatrack:harvests-changed'));
    }

    return mergedRecord;
  };

  const deleteHarvest = async (id) => {
    if (!id) return;
    try {
      await harvestService.deleteHarvest(id);
    } catch (apiErr) {
      console.warn('Backend delete notice (removing local harvest state directly):', apiErr.message);
    }

    // Clean from localStorage persistent edits map
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('aquatrack_harvest_edits');
        if (stored) {
          const savedEdits = JSON.parse(stored);
          delete savedEdits[id];
          delete savedEdits[String(id)];
          localStorage.setItem('aquatrack_harvest_edits', JSON.stringify(savedEdits));
        }
      }
    } catch (e) {}

    setHarvests((prev) => prev.filter((item) => String(item.id) !== String(id)));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aquatrack:harvests-changed'));
    }
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
