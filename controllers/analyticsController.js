const asyncHandler = require('express-async-handler');
const ExamResult = require('../models/examResultModel');

// @desc    Get user exam performance analytics
// @route   GET /api/analytics/user
// @access  Private
const getUserAnalytics = asyncHandler(async (req, res) => {
    console.log("Req user analytics controller ",req.user)
    const userId = req.user._id;

    const examResults = await ExamResult.find({ user: userId });

    const analytics = examResults.map(result => ({
        examDate: result.createdAt,
        scorePercentage: (result.score / result.totalQuestions) * 100
    }));

    res.json(analytics);
});

module.exports = { getUserAnalytics };
