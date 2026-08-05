import React, { createContext, useContext, useState, useMemo } from 'react';
import { MOCK_FEED_LOGS } from '../constants/feedData';

const FeedContext = createContext(null);

export const FeedProvider = ({ children }) => {
  const [feedLogs, setFeedLogs] = useState(MOCK_FEED_LOGS);

  const addFeedLog = (newFeedData) => {
    const newLog = {
      id: `feed-${Date.now()}`,
      cropId: newFeedData.cropId,
      cropName: newFeedData.cropName || 'Selected Crop',
      tankId: newFeedData.tankId || 'tank-1',
      tankName: newFeedData.tankName || 'Selected Tank',
      feedBrand: newFeedData.feedBrand,
      feedType: newFeedData.feedType,
      quantityKg: parseFloat(newFeedData.quantityKg),
      feedingDate: newFeedData.feedingDate,
      feedingTime: newFeedData.feedingTime,
      feedCost: parseFloat(newFeedData.feedCost),
      remainingStockKg: parseFloat(newFeedData.remainingStockKg),
      status: newFeedData.status || 'Completed',
      notes: newFeedData.notes || '',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setFeedLogs((prev) => [newLog, ...prev]);
    return newLog;
  };

  const updateFeedLog = (id, updatedData) => {
    setFeedLogs((prev) =>
      prev.map((log) => {
        if (log.id === id) {
          return {
            ...log,

            ...updatedData,
            quantityKg: parseFloat(updatedData.quantityKg),
            feedCost: parseFloat(updatedData.feedCost),
            remainingStockKg: parseFloat(updatedData.remainingStockKg),
          };
        }
        return log;
      })
    );
  };

  const deleteFeedLog = (id) => {
    setFeedLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const getFeedLogById = (id) => {
    return feedLogs.find((log) => log.id === id);
  };

  // Analytics Computation (Requirement 8 & Requirement 1)
  const analytics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Today's Feed (kg)
    const todaysFeedKg = feedLogs.reduce((acc, log) => {
      if (log.feedingDate === todayStr) {
        return acc + (parseFloat(log.quantityKg) || 0);
      }
      return acc;
    }, 0);

    // 2. Total Feed Used (kg)
    const totalFeedUsedKg = feedLogs.reduce((acc, log) => acc + (parseFloat(log.quantityKg) || 0), 0);

    // 3. Average Feed Per Day (kg)
    const uniqueDates = new Set(feedLogs.map((log) => log.feedingDate));
    const dayCount = uniqueDates.size || 1;
    const avgFeedPerDayKg = totalFeedUsedKg / dayCount;

    // 4. Total Feed Cost (₹)
    const totalFeedCostRupees = feedLogs.reduce((acc, log) => acc + (parseFloat(log.feedCost) || 0), 0);

    return {
      todaysFeedKg,
      totalFeedUsedKg,
      avgFeedPerDayKg: avgFeedPerDayKg.toFixed(1),
      totalFeedCostRupees,
    };
  }, [feedLogs]);

  return (
    <FeedContext.Provider
      value={{
        feedLogs,
        addFeedLog,
        updateFeedLog,
        deleteFeedLog,
        getFeedLogById,
        analytics,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
};

export const useFeed = () => {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error('useFeed must be used within a FeedProvider');
  }
  return context;
};

export default FeedContext;
