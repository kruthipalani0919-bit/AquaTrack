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
      const normalized = (Array.isArray(siteList) ? siteList : []).map((s) => ({
        ...s,
        area: s.area ?? s.landArea ?? s.totalArea ?? null,
        landArea: s.landArea ?? s.area ?? s.totalArea ?? null,
      }));
      setSites(normalized);
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
    const areaVal = Number(newSiteData.landArea ?? newSiteData.area);

    const payload = {
      siteName: newSiteData.siteName?.trim(),
      location: newSiteData.location?.trim(),
      area: areaVal,
    };

    const res = await siteService.createSite(payload);
    const created = res.data || res;
    const result = {
      ...created,
      area: areaVal,
      landArea: areaVal,
    };
    setSites((prev) => [result, ...prev]);
    return result;
  };

  const updateSite = async (siteId, updatedData) => {
    const areaVal = (updatedData.landArea !== undefined || updatedData.area !== undefined)
      ? Number(updatedData.landArea ?? updatedData.area)
      : undefined;

    const payload = {
      ...(updatedData.siteName ? { siteName: updatedData.siteName.trim() } : {}),
      ...(updatedData.location ? { location: updatedData.location.trim() } : {}),
      ...(areaVal !== undefined ? { area: areaVal } : {}),
    };

    const res = await siteService.updateSite(siteId, payload);
    const updated = res.data || res;
    const result = {
      ...updated,
      area: areaVal !== undefined ? areaVal : (updated.area ?? updated.landArea),
      landArea: areaVal !== undefined ? areaVal : (updated.area ?? updated.landArea),
    };
    setSites((prev) =>
      prev.map((site) => (site.id === siteId ? { ...site, ...result } : site))
    );
    return result;
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
