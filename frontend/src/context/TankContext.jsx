import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import tankService from '../services/tankService';
import { useAuth } from './AuthContext';
import { useSites } from './SiteContext';
import { emitDataMutation, subscribeToSyncBus } from '../utils/syncBus';

const TankContext = createContext(null);

export const TankProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const { sites = [] } = useSites();
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTanks = useCallback(async (isSilent = false) => {
    if (!isAuthenticated) {
      setTanks([]);
      return;
    }
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await tankService.getTanks();
      const tankList = res.data || res || [];
      const normalized = (Array.isArray(tankList) ? tankList : []).map((t) => ({
        ...t,
        id: String(t.id),
        name: t.tankName || t.name,
        tankName: t.tankName || t.name,
        siteName: t.site?.siteName || t.siteName || 'Site',
      }));
      setTanks(normalized);
    } catch (err) {
      console.error('Error fetching tanks:', err);
      setError(err.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchTanks();
  }, [fetchTanks, token]);

  // Subscribe to sync bus events for reactive cascading tank cleanup & re-fetching
  useEffect(() => {
    const unsubscribe = subscribeToSyncBus((detail) => {
      if (detail.entityType === 'SITE' && detail.action === 'DELETE' && detail.payload?.siteId) {
        setTanks((prev) => prev.filter((t) => String(t.siteId) !== String(detail.payload.siteId)));
        fetchTanks(true);
      } else if (detail.entityType === 'TANK') {
        if (detail.action === 'DELETE' && detail.payload?.tankId) {
          setTanks((prev) => prev.filter((t) => String(t.id) !== String(detail.payload.tankId)));
        }
        fetchTanks(true);
      }
    });
    return unsubscribe;
  }, [fetchTanks]);

  const addTank = async (newTankData) => {
    const payload = {
      siteId: newTankData.siteId,
      tankName: newTankData.tankName || newTankData.name,
      area: parseFloat(newTankData.area),
      depth: parseFloat(newTankData.depth || 6),
      waterSource: newTankData.waterSource || 'Borewell',
      ...(newTankData.hatcheryName && String(newTankData.hatcheryName).trim() ? { hatcheryName: String(newTankData.hatcheryName).trim() } : {}),
      ...(newTankData.hatcheryUnit && String(newTankData.hatcheryUnit).trim() ? { hatcheryUnit: String(newTankData.hatcheryUnit).trim() } : {}),
      ...(newTankData.remarks && String(newTankData.remarks).trim() ? { remarks: String(newTankData.remarks).trim() } : {}),
    };

    const res = await tankService.createTank(payload);
    const created = res.data || res;

    const matchingSite = sites.find((s) => String(s.id) === String(created.siteId || payload.siteId));
    const siteName = created.site?.siteName || matchingSite?.siteName || 'Site';

    const normalized = {
      ...created,
      id: String(created.id),
      name: created.tankName || created.name || payload.tankName,
      tankName: created.tankName || created.name || payload.tankName,
      siteName: siteName,
      site: created.site || matchingSite || { id: created.siteId, siteName },
    };

    setTanks((prev) => [normalized, ...prev]);
    fetchTanks(true);
    emitDataMutation('TANK', 'CREATE', normalized);
    return normalized;
  };

  const updateTank = async (id, updatedData) => {
    if (!id) throw new Error('Invalid tank ID');
    const targetId = String(id);

    const payload = {
      siteId: updatedData.siteId,
      tankName: updatedData.tankName || updatedData.name,
      area: parseFloat(updatedData.area),
      depth: parseFloat(updatedData.depth || 6),
      waterSource: updatedData.waterSource || 'Borewell',
      ...(updatedData.hatcheryName && String(updatedData.hatcheryName).trim() ? { hatcheryName: String(updatedData.hatcheryName).trim() } : {}),
      ...(updatedData.hatcheryUnit && String(updatedData.hatcheryUnit).trim() ? { hatcheryUnit: String(updatedData.hatcheryUnit).trim() } : {}),
      ...(updatedData.remarks && String(updatedData.remarks).trim() ? { remarks: String(updatedData.remarks).trim() } : {}),
    };

    const res = await tankService.updateTank(targetId, payload);
    const updated = res.data || res;

    const matchingSite = sites.find((s) => String(s.id) === String(updated.siteId || payload.siteId));
    const siteName = updated.site?.siteName || matchingSite?.siteName || 'Site';

    const normalized = {
      ...updated,
      id: targetId,
      name: updated.tankName || updated.name || payload.tankName,
      tankName: updated.tankName || updated.name || payload.tankName,
      siteName: siteName,
      site: updated.site || matchingSite || { id: updated.siteId || payload.siteId, siteName },
    };

    setTanks((prev) =>
      prev.map((tank) => (String(tank.id) === targetId ? { ...tank, ...normalized } : tank))
    );

    // Silent background refetch for 100% database & relationship consistency
    fetchTanks(true);

    emitDataMutation('TANK', 'UPDATE', normalized);
    return normalized;
  };

  const deleteTank = async (id, password) => {
    if (!id) return;
    const targetId = String(id);
    const targetTank = tanks.find((t) => String(t.id) === targetId);
    const siteId = targetTank?.siteId;

    await tankService.deleteTank(targetId, password);

    setTanks((prev) => prev.filter((tank) => String(tank.id) !== targetId));
    emitDataMutation('TANK', 'DELETE', { tankId: targetId, id: targetId, siteId });
  };

  const getTankById = (id) => {
    if (!id) return null;
    return tanks.find((tank) => String(tank.id) === String(id));
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
