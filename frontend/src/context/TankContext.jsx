import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import tankService from '../services/tankService';
import { useAuth } from './AuthContext';

const TankContext = createContext(null);

export const TankProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTanks = useCallback(async () => {
    if (!isAuthenticated) {
      setTanks([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await tankService.getTanks();
      const tankList = res.data || res || [];
      const normalized = tankList.map((t) => ({
        ...t,
        name: t.tankName || t.name,
      }));
      setTanks(normalized);
    } catch (err) {
      console.error('Error fetching tanks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchTanks();
  }, [fetchTanks, token]);

  const addTank = async (newTankData) => {
    const payload = {
      siteId: newTankData.siteId,
      tankName: newTankData.tankName || newTankData.name,
      area: parseFloat(newTankData.area),
      depth: parseFloat(newTankData.depth),
      waterSource: newTankData.waterSource,
      remarks: newTankData.remarks || undefined,
    };

    const res = await tankService.createTank(payload);
    const created = res.data || res;
    const normalized = {
      ...created,
      name: created.tankName || created.name,
    };
    setTanks((prev) => [normalized, ...prev]);
    return normalized;
  };

  const updateTank = async (id, updatedData) => {
    const payload = {
      ...(updatedData.siteId ? { siteId: updatedData.siteId } : {}),
      ...(updatedData.name || updatedData.tankName ? { tankName: updatedData.tankName || updatedData.name } : {}),
      ...(updatedData.area ? { area: parseFloat(updatedData.area) } : {}),
      ...(updatedData.depth ? { depth: parseFloat(updatedData.depth) } : {}),
      ...(updatedData.waterSource ? { waterSource: updatedData.waterSource } : {}),
      ...(updatedData.remarks !== undefined ? { remarks: updatedData.remarks } : {}),
    };

    const res = await tankService.updateTank(id, payload);
    const updated = res.data || res;
    const normalized = {
      ...updated,
      name: updated.tankName || updated.name,
    };
    setTanks((prev) =>
      prev.map((tank) => (tank.id === id ? { ...tank, ...normalized } : tank))
    );
    return normalized;
  };

  const deleteTank = async (id) => {
    await tankService.deleteTank(id);
    setTanks((prev) => prev.filter((tank) => tank.id !== id));
  };

  const getTankById = (id) => {
    return tanks.find((tank) => tank.id === id);
  };

  return (
    <TankContext.Provider
      value={{
        tanks,
        loading,
        error,
        fetchTanks,
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
