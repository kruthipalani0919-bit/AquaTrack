import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import stockingService from '../services/stockingService';
import { useAuth } from './AuthContext';
import { emitDataMutation, subscribeToSyncBus } from '../utils/syncBus';

const StockingContext = createContext(null);

export const StockingProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [stockings, setStockings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch real farm stock records from backend database
  const fetchStockings = useCallback(async (isSilent = false) => {
    if (!isAuthenticated) {
      setStockings([]);
      if (!isSilent) setLoading(false);
      return;
    }

    if (!isSilent) setLoading(true);
    setError(null);

    try {
      const res = await stockingService.getStockings();
      const stockingList = res?.data || res || [];
      setStockings(Array.isArray(stockingList) ? stockingList : []);
    } catch (err) {
      console.error('Error fetching farm stocking overview:', err);
      setError(err.message || 'Failed to load stock inventory');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchStockings();
  }, [fetchStockings, token]);

  // Subscribe to sync bus events for cascading cleanup & re-fetching
  useEffect(() => {
    const unsubscribe = subscribeToSyncBus((detail) => {
      if (['SITE', 'TANK', 'CROP', 'STOCKING', 'FEED', 'MEDICINE'].includes(detail.entityType)) {
        fetchStockings(true);
      }
    });
    return unsubscribe;
  }, [fetchStockings]);

  // Create real stock record in database
  const addStock = async (stockData) => {
    setError(null);
    const payload = {
      category: stockData.category.toUpperCase(),
      totalQuantity: parseFloat(stockData.totalQuantity),
      unit: stockData.unit ? stockData.unit.trim() : 'kg',
    };

    try {
      const res = await stockingService.createStocking(payload);
      const result = res?.data || res;
      await fetchStockings(true);
      emitDataMutation('STOCKING', 'CREATE', result);
      return result;
    } catch (err) {
      console.error('[StockingContext] Add stock error:', err);
      const msg = err.message || 'Failed to add stock record';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Allocate real stock to site in database
  const allocateStock = async (allocationData) => {
    setError(null);
    const { stockingId, category, siteId, allocatedQuantity, unit } = allocationData;

    let targetStockingId = stockingId;
    if (!targetStockingId && category) {
      const match = stockings.find((s) => {
        if (s.category?.toUpperCase() !== category.toUpperCase()) return false;
        const unallocated = s.unallocatedQuantity !== undefined
          ? parseFloat(s.unallocatedQuantity)
          : Math.max((parseFloat(s.totalQuantity) || 0) - (parseFloat(s.totalAllocated) || 0), 0);
        return unallocated > 0;
      });

      if (!match) {
        throw new Error(`No available unallocated stock for category "${category}". Please add stock first.`);
      }
      targetStockingId = match.id;
    }

    if (!targetStockingId) {
      throw new Error('Stocking ID is required for allocation.');
    }

    const payload = {
      siteId,
      allocatedQuantity: parseFloat(allocatedQuantity),
      unit: unit ? unit.trim() : 'kg',
    };

    try {
      const res = await stockingService.allocateStock(targetStockingId, payload);
      const result = res?.data || res;
      await fetchStockings(true);
      emitDataMutation('STOCKING', 'UPDATE', result);
      return result;
    } catch (err) {
      console.error('[StockingContext] Allocate stock error:', err);
      const msg = err.message || 'Failed to allocate stock to site';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Update real stock record in database
  const updateStock = async (id, stockData) => {
    setError(null);
    const payload = {
      totalQuantity: parseFloat(stockData.totalQuantity),
      unit: stockData.unit ? stockData.unit.trim() : 'kg',
    };

    try {
      const res = await stockingService.updateStocking(id, payload);
      const result = res?.data || res;
      await fetchStockings(true);
      emitDataMutation('STOCKING', 'UPDATE', result);
      return result;
    } catch (err) {
      console.error('[StockingContext] Update stock error:', err);
      const msg = err.message || 'Failed to update stock record';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Delete real stock record in database
  const deleteStock = async (id) => {
    setError(null);
    try {
      const res = await stockingService.deleteStocking(id);
      await fetchStockings(true);
      emitDataMutation('STOCKING', 'DELETE', { id });
      return res;
    } catch (err) {
      console.error('[StockingContext] Delete stock error:', err);
      const msg = err.message || 'Failed to delete stock record';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Update real site stock allocation in database
  const updateAllocation = async (allocationId, allocationData) => {
    setError(null);
    const payload = {
      allocatedQuantity: parseFloat(allocationData.allocatedQuantity),
    };

    try {
      const res = await stockingService.updateAllocation(allocationId, payload);
      const result = res?.data || res;
      await fetchStockings(true);
      emitDataMutation('STOCKING', 'UPDATE', result);
      return result;
    } catch (err) {
      console.error('[StockingContext] Update allocation error:', err);
      const msg = err.message || 'Failed to update site stock allocation';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Delete real site stock allocation in database
  const deleteAllocation = async (allocationId) => {
    setError(null);
    try {
      const res = await stockingService.deleteAllocation(allocationId);
      await fetchStockings(true);
      emitDataMutation('STOCKING', 'UPDATE', { allocationId });
      return res;
    } catch (err) {
      console.error('[StockingContext] Delete allocation error:', err);
      const msg = err.message || 'Failed to delete site stock allocation';
      setError(msg);
      throw new Error(msg);
    }
  };

  const getSiteAllocations = async (siteId) => {
    try {
      const res = await stockingService.getSiteStockAllocations(siteId);
      return res.data || res || [];
    } catch (err) {
      console.error(`Error fetching allocations for site #${siteId}:`, err);
      return [];
    }
  };

  return (
    <StockingContext.Provider
      value={{
        stockings,
        loading,
        error,
        fetchStockings,
        addStock,
        updateStock,
        deleteStock,
        allocateStock,
        updateAllocation,
        deleteAllocation,
        getSiteAllocations,
      }}
    >
      {children}
    </StockingContext.Provider>
  );
};

export const useStocking = () => {
  const context = useContext(StockingContext);
  if (!context) {
    throw new Error('useStocking must be used within a StockingProvider');
  }
  return context;
};

export default StockingContext;
