import {
    createFeed,
    getFeeds,
    getFeedById,
    updateFeed,
    deleteFeed,
    getRecentFeeds,
    getTodayFeedSummary
} from "../services/feed.service.js";

export const createFeedController = async (req, res) => {

    try {

        const feed = await createFeed(req.user.id, req.body);

        return res.status(201).json({
            success: true,
            message: "Feed entry created successfully",
            data: feed
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

export const getFeedsController = async (req, res) => {

    try {

        const feeds = await getFeeds(req.user.id);

        return res.status(200).json({
            success: true,
            message: "Feed entries fetched successfully",
            data: feeds
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

export const getFeedByIdController = async (req, res) => {

    try {

        const feed = await getFeedById(req.user.id, req.params.id);

        return res.status(200).json({
            success: true,
            message: "Feed entry fetched successfully",
            data: feed
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

export const updateFeedController = async (req, res) => {

    try {

        const feed = await updateFeed(
            req.user.id,
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Feed entry updated successfully",
            data: feed
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

export const deleteFeedController = async (req, res) => {

    try {

        await deleteFeed(req.user.id, req.params.id);

        return res.status(200).json({
            success: true,
            message: "Feed entry deleted successfully"
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

export const getRecentFeedsController = async (req, res) => {

    try {

        const feeds = await getRecentFeeds(req.user.id);

        return res.status(200).json({
            success: true,
            message: "Recent feed entries fetched successfully",
            data: feeds
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

export const getTodayFeedSummaryController = async (req, res) => {

    try {

        const summary = await getTodayFeedSummary(req.user.id);

        return res.status(200).json({
            success: true,
            message: "Today's feed summary fetched successfully",
            data: summary
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};