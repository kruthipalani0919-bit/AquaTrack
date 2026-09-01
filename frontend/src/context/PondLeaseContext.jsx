import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import pondLeaseService from '../services/pondLeaseService';
import { useAuth } from './AuthContext';
import { emitDataMutation, subscribeToSyncBus } from '../utils/syncBus';

const PondLeaseContext = createContext(null);

export const PondLeaseProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeases = useCallback(async (isSilent = false) => {
    if (!isAuthenticated) {
      setLeases([]);
      return;
    }
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await pondLeaseService.getPondLeases();
      const list = res.data || res || [];
      const normalized = (Array.isArray(list) ? list : []).map((l) => ({
        ...l,
        id: String(l.id),
      }));
      setLeases(normalized);
    } catch (err) {
      console.error('Error fetching pond leases:', err);
      setError(err.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchLeases();
  }, [fetchLeases, token]);

  // Subscribe to sync bus events for reactive cascading cleanup
  useEffect(() => {
    const unsubscribe = subscribeToSyncBus((detail) => {
      if (detail.action === 'DELETE') {
        if (detail.entityType === 'TANK' && detail.payload?.tankId) {
          setLeases((prev) => prev.filter((l) => String(l.tankId) !== String(detail.payload.tankId)));
        }
        fetchLeases(true);
      } else if (['SITE', 'TANK', 'CROP', 'LEASE'].includes(detail.entityType)) {
        fetchLeases(true);
      }
    });
    return unsubscribe;
  }, [fetchLeases]);

  const addLease = async (leaseData) => {
    const payload = {
      tankId: leaseData.tankId,
      totalLeaseAmount: parseFloat(leaseData.totalLeaseAmount),
      leaseStartDate: leaseData.leaseStartDate,
      leaseEndDate: leaseData.leaseEndDate,
      remarks: leaseData.remarks || undefined,
    };

    const res = await pondLeaseService.createPondLease(payload);
    const created = res.data || res;
    const normalized = {
      ...created,
      id: String(created.id),
    };
    setLeases((prev) => [normalized, ...prev]);
    emitDataMutation('LEASE', 'CREATE', normalized);
    return normalized;
  };

  const updateLease = async (id, updatedData) => {
    const targetId = String(id);
    const payload = {
      ...(updatedData.tankId ? { tankId: updatedData.tankId } : {}),
      ...(updatedData.totalLeaseAmount ? { totalLeaseAmount: parseFloat(updatedData.totalLeaseAmount) } : {}),
      ...(updatedData.leaseStartDate ? { leaseStartDate: updatedData.leaseStartDate } : {}),
      ...(updatedData.leaseEndDate ? { leaseEndDate: updatedData.leaseEndDate } : {}),
      ...(updatedData.remarks !== undefined ? { remarks: updatedData.remarks } : {}),
    };

    const res = await pondLeaseService.updatePondLease(targetId, payload);
    const updated = res.data || res;
    const normalized = {
      ...updated,
      id: targetId,
    };
    setLeases((prev) => prev.map((item) => (String(item.id) === targetId ? normalized : item)));
    emitDataMutation('LEASE', 'UPDATE', normalized);
    return normalized;
  };

  const deleteLease = async (id, password) => {
    if (!id) return;
    const targetId = String(id);
    const deleteFn = pondLeaseService.deletePondLease || pondLeaseService.deleteLease;
    if (deleteFn) {
      await deleteFn(targetId, password);
    }
    setLeases((prev) => prev.filter((item) => String(item.id) !== targetId));
    emitDataMutation('LEASE', 'DELETE', { id: targetId });
  };

  const getLeaseCropAllocations = async (id) => {
    if (!id) return null;
    const targetId = String(id);
    const res = await pondLeaseService.getLeaseCropAllocations(targetId);
    return res.data || res;
  };

  return (
    <PondLeaseContext.Provider
      value={{
        leases,
        loading,
        error,
        fetchLeases,
        addLease,
        updateLease,
        deleteLease,
        getLeaseCropAllocations,
      }}
    >
      {children}
    </PondLeaseContext.Provider>
  );
};

export const usePondLeases = () => {
  const context = useContext(PondLeaseContext);
  if (!context) {
    throw new Error('usePondLeases must be used within a PondLeaseProvider');
  }
  return context;
};

export default PondLeaseContext;
