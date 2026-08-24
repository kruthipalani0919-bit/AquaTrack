import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import stockingService from '../services/stockingService';
import { useAuth } from './AuthContext';

const StockingContext = createContext(null);

export const StockingProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [stockings, setStockings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch real farm stock records from backend database
  const fetchStockings = useCallback(async () => {
    if (!isAuthenticated) {
      setStockings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await stockingService.getStockings();
      const stockingList = res?.data || res || [];
      console.log('[StockingContext] Loaded real database stocking items count:', Array.isArray(stockingList) ? stockingList.length : 0);
      setStockings(Array.isArray(stockingList) ? stockingList : []);
    } catch (err) {
      console.error('Error fetching farm stocking overview:', err);
      setError(err.message || 'Failed to load stock inventory');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchStockings();
  }, [fetchStockings, token]);

  // Create real stock record in database
  const addStock = async (stockData) => {
    setError(null);
    const payload = {
      category: stockData.category.toUpperCase(),
      totalQuantity: parseFloat(stockData.totalQuantity),
      unit: stockData.unit ? stockData.unit.trim() : 'kg',
    };

    console.log('[StockingContext] Posting new stock payload to backend:', payload);
    try {
      const res = await stockingService.createStocking(payload);
      await fetchStockings();
      return res?.data || res;
    } catch (err) {
      console.error('[StockingContext] Add stock error:', err);
      const msg = err.message || 'Failed to add stock record';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Update real stock record in database
  const updateStock = async (id, stockData) => {
    setError(null);
    const payload = {
      category: stockData.category ? stockData.category.toUpperCase() : undefined,
      totalQuantity: stockData.totalQuantity !== undefined ? parseFloat(stockData.totalQuantity) : undefined,
      unit: stockData.unit ? stockData.unit.trim() : undefined,
    };

    if (stockData.costPerKg !== undefined && stockData.costPerKg !== '') {
      payload.costPerKg = parseFloat(stockData.costPerKg);
    }

    console.log(`[StockingContext] Updating stock #${id} payload:`, payload);
    try {
      const res = await stockingService.updateStocking(id, payload);
      await fetchStockings();
      return res?.data || res;
    } catch (err) {
      console.error('[StockingContext] Update stock error:', err);
      const msg = err.message || 'Failed to update stock record';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Delete real stock record from database
  const deleteStock = async (id) => {
    setError(null);
    console.log(`[StockingContext] Deleting stock #${id}`);
    try {
      const res = await stockingService.deleteStocking(id);
      await fetchStockings();
      return res?.data || res;
    } catch (err) {
      console.error('[StockingContext] Delete stock error:', err);
      const msg = err.message || 'Failed to delete stock record';
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
      throw new Error('Stocking record ID is required for allocation.');
    }

    const payload = {
      siteId,
      allocatedQuantity: parseFloat(allocatedQuantity),
      unit: unit ? unit.trim() : 'kg',
    };

    console.log(`[StockingContext] Allocating stock #${targetStockingId} to site #${siteId}:`, payload);
    try {
      const res = await stockingService.allocateStock(targetStockingId, payload);
      await fetchStockings();
      return res?.data || res;
    } catch (err) {
      console.error('[StockingContext] Allocation API error:', err);
      const msg = err.message || 'Failed to allocate stock to site';
      setError(msg);
      throw new Error(msg);
    }
  };

  const getSiteAllocations = async (siteId) => {
    try {
      const res = await stockingService.getSiteStockAllocations(siteId);
      return res?.data || res || [];
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
