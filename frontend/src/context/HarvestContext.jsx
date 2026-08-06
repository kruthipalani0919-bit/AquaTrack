import React, { createContext, useContext, useState } from 'react';
import { MOCK_HARVESTS } from '../constants/harvestData';

const HarvestContext = createContext(null);

export const HarvestProvider = ({ children }) => {
  const [harvests, setHarvests] = useState(MOCK_HARVESTS);

  const addHarvest = (newHarvestData) => {
    const newHarvest = {
      id: `harv-${Date.now()}`,
      tankId: newHarvestData.tankId,
      tankName: newHarvestData.tankName || 'Tank 1',
      harvestDate: newHarvestData.harvestDate,
      production: parseFloat(newHarvestData.production) || 0,
      averageWeight: parseFloat(newHarvestData.averageWeight) || 0,
      survivalRate: parseFloat(newHarvestData.survivalRate) || 0,
      sellingPrice: parseFloat(newHarvestData.sellingPrice) || 0,
      buyerName: newHarvestData.buyerName,
      transportationCost: parseFloat(newHarvestData.transportationCost) || 0,
      harvestExpense: parseFloat(newHarvestData.harvestExpense) || 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setHarvests((prev) => [newHarvest, ...prev]);
    return newHarvest;
  };

  const updateHarvest = (id, updatedData) => {
    setHarvests((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            ...updatedData,
            production: parseFloat(updatedData.production) || 0,
            averageWeight: parseFloat(updatedData.averageWeight) || 0,
            survivalRate: parseFloat(updatedData.survivalRate) || 0,
            sellingPrice: parseFloat(updatedData.sellingPrice) || 0,
            transportationCost: parseFloat(updatedData.transportationCost) || 0,
            harvestExpense: parseFloat(updatedData.harvestExpense) || 0,
          };
        }
        return item;
      })
    );
  };

  const deleteHarvest = (id) => {
    setHarvests((prev) => prev.filter((item) => item.id !== id));
  };

  const getHarvestById = (id) => {
    return harvests.find((item) => item.id === id);
  };

  return (
    <HarvestContext.Provider
      value={{
        harvests,
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
