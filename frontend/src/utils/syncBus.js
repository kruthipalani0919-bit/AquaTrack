/**
 * AquaTrack Platform-Wide Data Synchronization Bus
 * Provides centralized, dependency-aware reactive state updates and cascading cleanup
 * across all context providers, pages, components, and filters.
 */

export const SYNC_EVENTS = {
  DATA_MUTATED: 'aquatrack:data-mutated',
  SITE_DELETED: 'aquatrack:site-deleted',
  TANK_DELETED: 'aquatrack:tank-deleted',
  CROP_DELETED: 'aquatrack:crop-deleted',
};

/**
 * Emit a data mutation event across all mounted Contexts, Pages, and Components
 * @param {string} entityType - 'SITE' | 'TANK' | 'CROP' | 'STOCKING' | 'FEED' | 'MEDICINE' | 'EXPENSE' | 'LEASE' | 'HARVEST'
 * @param {string} action - 'CREATE' | 'UPDATE' | 'DELETE'
 * @param {object} payload - e.g. { id, siteId, tankId, cropId, ... }
 */
export function emitDataMutation(entityType, action, payload = {}) {
  if (typeof window === 'undefined') return;

  const detail = {
    entityType,
    action,
    payload,
    timestamp: Date.now(),
  };

  // Dispatch custom window event for generic data mutation
  window.dispatchEvent(new CustomEvent(SYNC_EVENTS.DATA_MUTATED, { detail }));

  // Dispatch specific deletion events for cascading cleanup
  if (action === 'DELETE') {
    const siteId = payload.siteId || (entityType === 'SITE' ? payload.id : undefined);
    const tankId = payload.tankId || (entityType === 'TANK' ? payload.id : undefined);
    const cropId = payload.cropId || (entityType === 'CROP' ? payload.id : undefined);

    if (entityType === 'SITE' || siteId) {
      window.dispatchEvent(
        new CustomEvent(SYNC_EVENTS.SITE_DELETED, { detail: { siteId: String(siteId) } })
      );
    }

    if (entityType === 'TANK' || tankId) {
      window.dispatchEvent(
        new CustomEvent(SYNC_EVENTS.TANK_DELETED, { detail: { tankId: String(tankId), siteId: siteId ? String(siteId) : undefined } })
      );
    }

    if (entityType === 'CROP' || cropId) {
      window.dispatchEvent(
        new CustomEvent(SYNC_EVENTS.CROP_DELETED, { detail: { cropId: String(cropId), tankId: tankId ? String(tankId) : undefined } })
      );
    }
  }
}

/**
 * Subscribe to sync bus events
 * @param {function} callback
 * @returns {function} unsubscribe function
 */
export function subscribeToSyncBus(callback) {
  if (typeof window === 'undefined') return () => {};

  const handler = (e) => {
    if (callback && e.detail) {
      callback(e.detail);
    }
  };

  window.addEventListener(SYNC_EVENTS.DATA_MUTATED, handler);
  window.addEventListener(SYNC_EVENTS.SITE_DELETED, handler);
  window.addEventListener(SYNC_EVENTS.TANK_DELETED, handler);
  window.addEventListener(SYNC_EVENTS.CROP_DELETED, handler);

  return () => {
    window.removeEventListener(SYNC_EVENTS.DATA_MUTATED, handler);
    window.removeEventListener(SYNC_EVENTS.SITE_DELETED, handler);
    window.removeEventListener(SYNC_EVENTS.TANK_DELETED, handler);
    window.removeEventListener(SYNC_EVENTS.CROP_DELETED, handler);
  };
}

export default {
  SYNC_EVENTS,
  emitDataMutation,
  subscribeToSyncBus,
};
