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


// @desc    Get user performance by subcategory with pagination
// @route   GET /api/analytics/subcategory
// @access  Private
const getUserPerformanceBySubcategory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 0 , category} = req.query;
    const itemsPerPage = 7; // Number of days per page

    // Calculate the date range for the requested page
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - page * itemsPerPage);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - itemsPerPage);

    try {
        const examResults = await ExamResult.find({
            user: userId,
            createdAt: { $gte: startDate, $lt: endDate },
        }).populate({
            path: 'questions.question',
            match: { category }, // Filter questions by category
        });

        // Aggregate performance data by subcategory
        const performanceData = {};

        examResults.forEach((result) => {
            result.questions.forEach((q) => {
                if (q.question && q.question.subcategory) {
                    const subcategory = q.question.subcategory;

                    if (!performanceData[subcategory]) {
                        performanceData[subcategory] = { totalQuestions: 0, correctAnswers: 0 };
                    }

                    performanceData[subcategory].totalQuestions += 1;
                    if (q.selectedAnswer === q.question.correctAnswer) {
                        performanceData[subcategory].correctAnswers += 1;
                    }
                }
            });
        });

        // Calculate percentage for each subcategory
        const analytics = Object.keys(performanceData).map((subcategory) => ({
            subcategory,
            percentage: (performanceData[subcategory].correctAnswers / performanceData[subcategory].totalQuestions) * 100,
        }));

        // Calculate total number of pages
        const totalExamResults = await ExamResult.countDocuments({
            user: userId,
            createdAt: { $gte: startDate, $lt: endDate },
        });
        const totalPages = Math.ceil(totalExamResults / itemsPerPage);

        res.json({
            analytics,
            totalPages,
            currentPage: Number(page),
            startDate,
            endDate,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch performance data', error: error.message });
    }
});



module.exports = { getUserAnalytics , getUserPerformanceBySubcategory};
