import api from './api';

/**
 * Feed Management Service
 */
export const createFeed = async (data) => {
  try {
    const response = await api.post('/feed', data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to record feed entry');
  }
};

export const getFeeds = async () => {
  try {
    const response = await api.get('/feed');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch feed logs');
  }
};

export const getRecentFeeds = async () => {
  try {
    const response = await api.get('/feed/recent');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch recent feeds');
  }
};

export const getTodayFeedSummary = async () => {
  try {
    const response = await api.get('/feed/today');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch today feed summary');
  }
};

export const getFeedById = async (id) => {
  try {
    const response = await api.get(`/feed/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to fetch feed log #${id}`);
  }
};

export const updateFeed = async (id, data) => {
  try {
    const response = await api.put(`/feed/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to update feed log #${id}`);
  }
};

export const deleteFeed = async (id) => {
  try {
    const response = await api.delete(`/feed/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || `Failed to delete feed log #${id}`);
  }
};

export const feedService = {
  createFeed,
  getFeeds,
  getRecentFeeds,
  getTodayFeedSummary,
  getFeedById,
  updateFeed,
  deleteFeed,
};

export default feedService;

