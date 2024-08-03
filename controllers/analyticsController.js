const asyncHandler = require('express-async-handler');
const ExamResult = require('../models/examResultModel');

// @desc    Get user exam performance analytics
// @route   GET /api/analytics/user
// @access  Private
const getUserAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 0, limit = 7 } = req.query; // Page for pagination and limit for number of records

    try {
        // Define the number of days for each page
        const daysPerPage = limit;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - (page + 1) * daysPerPage);
        endDate.setDate(endDate.getDate() - page * daysPerPage);

        // Fetch results within the date range
        const examResults = await ExamResult.find({ 
            user: userId,
            createdAt: { $gte: startDate, $lt: endDate }
        })
        .sort({ createdAt: -1 }); // Sort by newest first

        const analytics = examResults.map(result => ({
            examDate: result.createdAt,
            scorePercentage: (result.score / result.totalQuestions) * 100
        }));

        res.json(analytics.reverse());
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user analytics', error: error.message });
    }
});

module.exports = { getUserAnalytics };
