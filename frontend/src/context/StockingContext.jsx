import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import stockingService from '../services/stockingService';
import { useAuth } from './AuthContext';

const StockingContext = createContext(null);

export const StockingProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [stockings, setStockings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStockings = useCallback(async () => {
    if (!isAuthenticated) {
      setStockings([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await stockingService.getStockings();
      const stockingList = res.data || res || [];
      setStockings(stockingList);
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

  const addStock = async (stockData) => {
    const payload = {
      category: stockData.category.toUpperCase(),
      totalQuantity: parseFloat(stockData.totalQuantity),
      unit: stockData.unit ? stockData.unit.trim() : 'kg',
    };

    const res = await stockingService.createStocking(payload);
    await fetchStockings();
    return res.data || res;
  };

  const allocateStock = async (allocationData) => {
    const { stockingId, category, siteId, allocatedQuantity, unit } = allocationData;

    let targetStockingId = stockingId;
    if (!targetStockingId && category) {
      const match = stockings.find(
        (s) => s.category?.toUpperCase() === category.toUpperCase()
      );
      if (!match) {
        throw new Error(`No farm stock found for category "${category}". Please add farm stock first.`);
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

    const res = await stockingService.allocateStock(targetStockingId, payload);
    await fetchStockings();
    return res.data || res;
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
