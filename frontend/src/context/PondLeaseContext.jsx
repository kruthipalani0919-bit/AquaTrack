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
      setLeases(list);
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
    setLeases((prev) => [created, ...prev]);
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
    setLeases((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  };

  const deleteLease = async (id) => {
    await pondLeaseService.deleteLease(id);
    setLeases((prev) => prev.filter((item) => item.id !== id));
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
