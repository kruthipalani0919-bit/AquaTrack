import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import siteService from '../services/siteService';
import { useAuth } from './AuthContext';

const SiteContext = createContext(null);

export const SiteProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSites = useCallback(async () => {
    if (!isAuthenticated) {
      setSites([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await siteService.getSites();
      const siteList = res.data || res || [];
      setSites(Array.isArray(siteList) ? siteList : []);
    } catch (err) {
      console.error('Error fetching sites:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchSites();
  }, [fetchSites, token]);

  const addSite = async (newSiteData) => {
    const payload = {
      siteName: newSiteData.siteName?.trim(),
      location: newSiteData.location?.trim(),
      district: newSiteData.district?.trim(),
      state: newSiteData.state?.trim(),
      gpsLocation: newSiteData.gpsLocation?.trim() || undefined,
      remarks: newSiteData.remarks?.trim() || undefined,
    };

    const res = await siteService.createSite(payload);
    const created = res.data || res;
    setSites((prev) => [created, ...prev]);
    return created;
  };

  const updateSite = async (siteId, updatedData) => {
    const payload = {
      ...(updatedData.siteName ? { siteName: updatedData.siteName.trim() } : {}),
      ...(updatedData.location ? { location: updatedData.location.trim() } : {}),
      ...(updatedData.district ? { district: updatedData.district.trim() } : {}),
      ...(updatedData.state ? { state: updatedData.state.trim() } : {}),
      ...(updatedData.gpsLocation !== undefined ? { gpsLocation: updatedData.gpsLocation?.trim() || '' } : {}),
      ...(updatedData.remarks !== undefined ? { remarks: updatedData.remarks?.trim() || '' } : {}),
    };

    const res = await siteService.updateSite(siteId, payload);
    const updated = res.data || res;
    setSites((prev) =>
      prev.map((site) => (site.id === siteId ? { ...site, ...updated } : site))
    );
    return updated;
  };

  const deleteSite = async (siteId) => {
    await siteService.deleteSite(siteId);
    setSites((prev) => prev.filter((site) => site.id !== siteId));
  };

  const getSiteById = (siteId) => {
    return sites.find((site) => site.id === siteId);
  };

  return (
    <SiteContext.Provider
      value={{
        sites,
        loading,
        error,
        fetchSites,
        addSite,
        updateSite,
        deleteSite,
        getSiteById,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSites = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSites must be used within a SiteProvider');
  }
  return context;
};

export default SiteContext;
