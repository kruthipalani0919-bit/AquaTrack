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
      const normalized = list.map((h) => ({
        ...h,
        harvestDate: h.harvestDate ? new Date(h.harvestDate).toISOString().split('T')[0] : h.harvestDate,
        tankName: h.crop?.tank?.tankName || h.tankName || 'Tank',
        cropName: h.crop?.cropName || h.cropName || 'Crop',
      }));
      setHarvests(normalized);
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

    const res = await harvestService.createHarvest(payload);
    const created = res.data || res;
    const normalized = {
      ...created,
      harvestDate: created.harvestDate ? new Date(created.harvestDate).toISOString().split('T')[0] : payload.harvestDate,
      tankName: newHarvestData.tankName || 'Tank',
    };
    setHarvests((prev) => [normalized, ...prev]);
    return normalized;
  };

  const deleteHarvest = async (id) => {
    await harvestService.deleteHarvest(id);
    setHarvests((prev) => prev.filter((item) => item.id !== id));
  };

  const getHarvestById = (id) => {
    return harvests.find((item) => item.id === id);
  };

  return (
    <HarvestContext.Provider
      value={{
        harvests,
        loading,
        error,
        fetchHarvests,
        addHarvest,
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
