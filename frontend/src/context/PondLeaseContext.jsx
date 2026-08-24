import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import pondLeaseService from '../services/pondLeaseService';
import { useAuth } from './AuthContext';

const PondLeaseContext = createContext(null);

export const PondLeaseProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeases = useCallback(async () => {
    if (!isAuthenticated) {
      setLeases([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await pondLeaseService.getPondLeases();
      const list = res.data || res || [];
      setLeases(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching pond leases:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchLeases();
  }, [fetchLeases, token]);

  const addLease = async (newLeaseData) => {
    const payload = {
      tankId: newLeaseData.tankId,
      totalLeaseAmount: parseFloat(newLeaseData.totalLeaseAmount),
      leaseStartDate: newLeaseData.leaseStartDate,
      leaseEndDate: newLeaseData.leaseEndDate,
      ...(newLeaseData.remarks ? { remarks: newLeaseData.remarks } : {}),
    };

    const res = await pondLeaseService.createPondLease(payload);
    const created = res.data || res;
    setLeases((prev) => [created, ...prev]);

    // Background refetch to sync nested tank/site references cleanly
    try {
      await fetchLeases();
    } catch (refetchErr) {
      console.warn('Background refetch leases notice:', refetchErr.message);
    }

    return created;
  };

  const updateLease = async (id, updatedData) => {
    const payload = {
      ...(updatedData.tankId ? { tankId: updatedData.tankId } : {}),
      ...(updatedData.totalLeaseAmount ? { totalLeaseAmount: parseFloat(updatedData.totalLeaseAmount) } : {}),
      ...(updatedData.leaseStartDate ? { leaseStartDate: updatedData.leaseStartDate } : {}),
      ...(updatedData.leaseEndDate ? { leaseEndDate: updatedData.leaseEndDate } : {}),
      ...(updatedData.remarks !== undefined ? { remarks: updatedData.remarks } : {}),
    };

    const res = await pondLeaseService.updatePondLease(id, payload);
    const updated = res.data || res;
    setLeases((prev) => prev.map((item) => (String(item.id) === String(id) ? { ...item, ...updated } : item)));

    try {
      await fetchLeases();
    } catch (refetchErr) {
      console.warn('Background refetch leases notice:', refetchErr.message);
    }

    return updated;
  };

  const deleteLease = async (id) => {
    if (!id) return;
    try {
      if (pondLeaseService.deleteLease) {
        await pondLeaseService.deleteLease(id);
      } else if (pondLeaseService.deletePondLease) {
        await pondLeaseService.deletePondLease(id);
      }
    } catch (apiErr) {
      console.warn('Backend delete pond lease notice (removing local state directly):', apiErr.message);
    }

    // Always remove deleted lease from state using stringified ID comparison
    setLeases((prev) => prev.filter((item) => String(item.id) !== String(id)));
  };

  const getLeaseCropAllocations = async (id) => {
    const res = await pondLeaseService.getLeaseCropAllocations(id);
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
