import React, { createContext, useContext, useState } from 'react';
import { MOCK_TANKS } from '../constants/tankData';

const TankContext = createContext(null);

export const TankProvider = ({ children }) => {
  const [tanks, setTanks] = useState(MOCK_TANKS);

  const addTank = (newTankData) => {
    const newTank = {
      id: `tank-${Date.now()}`,
      name: newTankData.name,
      area: parseFloat(newTankData.area),
      depth: parseFloat(newTankData.depth),
      waterSource: newTankData.waterSource,
      status: newTankData.status || 'Active',
      remarks: newTankData.remarks || '',
      createdAt: new Date().toISOString().split('T')[0],
      lastTested: new Date().toISOString().split('T')[0],
    };

    setTanks((prev) => [newTank, ...prev]);
    return newTank;
  };

  const updateTank = (id, updatedData) => {
    setTanks((prev) =>
      prev.map((tank) => {
        if (tank.id === id) {
          return {
            ...tank,

            ...updatedData,
            area: parseFloat(updatedData.area),
            depth: parseFloat(updatedData.depth),
          };
        }
        return tank;
      })
    );
  };

  const deleteTank = (id) => {
    setTanks((prev) => prev.filter((tank) => tank.id !== id));
  };

  const getTankById = (id) => {
    return tanks.find((tank) => tank.id === id);
  };

  return (
    <TankContext.Provider
      value={{
        tanks,
        addTank,
        updateTank,
        deleteTank,
        getTankById,
      }}
    >
      {children}
    </TankContext.Provider>
  );
};

export const useTanks = () => {
  const context = useContext(TankContext);
  if (!context) {
    throw new Error('useTanks must be used within a TankProvider');
  }
  return context;
};

export default TankContext;
