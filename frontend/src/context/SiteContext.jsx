import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import siteService from '../services/siteService';
import { useAuth } from './AuthContext';
import { emitDataMutation, subscribeToSyncBus } from '../utils/syncBus';

const SiteContext = createContext(null);

export const SiteProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  const fetchSites = useCallback(async (isSilent = false) => {
    if (!isAuthenticated) {
      setSites([]);
      setLoading(false);
      setError(null);
      return;
    }

    const currentRequestId = ++requestIdRef.current;

    if (!isSilent) {
      setLoading(true);
    }

    try {
      const res = await siteService.getSites();
      if (currentRequestId !== requestIdRef.current) return;

      const siteList = res.data || res || [];
      const normalized = (Array.isArray(siteList) ? siteList : []).map((s) => {
        const areaNum = parseFloat(s.area ?? s.landArea ?? s.totalArea);
        const validArea = !isNaN(areaNum) ? areaNum : null;
        return {
          ...s,
          id: String(s.id),
          area: validArea,
          landArea: validArea,
        };
      });

      setSites(normalized);
      setError(null);
    } catch (err) {
      console.error('Error fetching sites:', err);
      if (currentRequestId !== requestIdRef.current) return;

      setError(err.message || 'Failed to load sites');
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSites();
    }
  }, [fetchSites, token, isAuthenticated]);

  // Subscribe to sync bus events for reactive platform-wide site updates
  useEffect(() => {
    const unsubscribe = subscribeToSyncBus((detail) => {
      if (['SITE', 'TANK', 'CROP'].includes(detail.entityType)) {
        fetchSites(true);
      }
    });
    return unsubscribe;
  }, [fetchSites]);

  const addSite = async (newSiteData) => {
    const areaVal = Number(newSiteData.landArea ?? newSiteData.area);

    const payload = {
      siteName: newSiteData.siteName?.trim(),
      location: newSiteData.location?.trim(),
      area: areaVal,
      district: newSiteData.district?.trim() || 'District',
      state: newSiteData.state?.trim() || 'State',
    };

    const res = await siteService.createSite(payload);
    const created = res.data || res;
    const finalArea = created.area ?? areaVal;
    const result = {
      ...created,
      id: String(created.id),
      area: finalArea,
      landArea: finalArea,
    };
    setSites((prev) => [result, ...prev]);
    setError(null);
    emitDataMutation('SITE', 'CREATE', result);
    return result;
  };

  const updateSite = async (siteId, updatedData) => {
    const targetId = String(siteId);
    const areaVal = (updatedData.landArea !== undefined || updatedData.area !== undefined)
      ? Number(updatedData.landArea ?? updatedData.area)
      : undefined;

    const payload = {
      ...(updatedData.siteName ? { siteName: updatedData.siteName.trim() } : {}),
      ...(updatedData.location ? { location: updatedData.location.trim() } : {}),
      ...(areaVal !== undefined ? { area: areaVal } : {}),
      district: updatedData.district?.trim() || 'District',
      state: updatedData.state?.trim() || 'State',
    };

    const res = await siteService.updateSite(targetId, payload);
    const updated = res.data || res;
    const finalArea = updated.area ?? areaVal;
    const result = {
      ...updated,
      id: targetId,
      area: finalArea,
      landArea: finalArea,
    };
    setSites((prev) =>
      prev.map((site) => (String(site.id) === targetId ? { ...site, ...result } : site))
    );
    setError(null);
    emitDataMutation('SITE', 'UPDATE', result);
    return result;
  };

  const deleteSite = async (siteId) => {
    if (!siteId) return;
    const targetId = String(siteId);

    try {
      await siteService.deleteSite(targetId);
    } catch (err) {
      console.warn('Backend site delete notice:', err.message);
    }

    setSites((prev) => prev.filter((site) => String(site.id) !== targetId));
    setError(null);

    // Emit reactive cascade deletion mutation across the entire application
    emitDataMutation('SITE', 'DELETE', { id: targetId, siteId: targetId });
  };

  const getSiteById = (siteId) => {
    if (!siteId) return null;
    return sites.find((site) => String(site.id) === String(siteId));
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
