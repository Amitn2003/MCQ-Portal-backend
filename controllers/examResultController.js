const asyncHandler = require('express-async-handler');
const ExamResult = require('../models/examResultModel');
const Question = require("../models/questionModel")
// @desc    Create new exam result
// @route   POST /api/examResults
// @access  Private
const addExamResult = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    try {
        const { questions, score, totalQuestions, accuracy, timeTaken } = req.body;
        console.log("exam result controller", req.body);


        // Fetch questions to determine topics
        const questionIds = questions.map(question => question.question);
        const fetchedQuestions = await Question.find({ _id: { $in: questionIds } });

        // Extract unique topics from the fetched questions
        const topics = [...new Set(fetchedQuestions.map(q => q.category))];
        
        // Filter out questions with null selectedAnswer
        const validQuestions = questions.filter(question => question.selectedAnswer !== null);
        console.log("Valid questions", validQuestions);


        // Filter out questions with null selectedAnswer
        // const validQuestions = questions.filter(question => question.selectedAnswer !== null);
        // console.log("Valid qs", validQuestions)

        const examResult = new ExamResult({
            user: req.user._id,
            questions: validQuestions,
            score,
            totalQuestions,
            accuracy,
            timeTaken,  // Add time taken to the result
            topics      // Add topics to the result
        });
        console.log("Before saving exam result model", examResult);

        const createdExamResult = await examResult.save();
        console.log("Created Result", createdExamResult);

        res.status(201).json(createdExamResult);
    } catch (error) {
        console.error('Error saving exam result:', error.message);
        res.status(500).json({ message: 'Failed to save exam result', error: error.message });
    }
});

// @desc    Get user exam results
// @route   GET /api/examResults
// @access  Private
const getUserExamResults = asyncHandler(async (req, res) => {
    const examResults = await ExamResult.find({ user: req.user._id })
    .populate('questions.question')
    .sort({ createdAt: -1 });

    res.json(examResults);
});




// @desc    Get average time per question for all exams
// @route   GET /api/examResults/averageTimePerQuestion
// @access  Private
const getAverageTimePerQuestion = asyncHandler(async (req, res) => {
    const { page = 0 } = req.query; // Get the page number from query, default to 0

    try {
        // Calculate date range for the page
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset to midnight for consistent date comparison

        const endDate = new Date(today -1); // Start of the current 7-day period
        
        endDate.setDate(today.getDate() - page * 7);

        const startDate = new Date(endDate); // Start of the previous 7-day period
        startDate.setDate(endDate.getDate() - 7);

        console.log(`Fetching exams from ${startDate} to ${endDate}`); // Debugging

        // Find all exam results for the user within the calculated date range
        const examResults = await ExamResult.find({
            user: req.user._id,
            createdAt: { $gte: startDate, $lt: endDate }, // Filter by date range
        }).sort({ createdAt: -1 });

        // Calculate average time per question for each exam
        const resultsData = examResults.map((exam) => ({
            examId: exam._id,
            averageTime: exam.timeTaken / exam.totalQuestions, // Calculate average time per question
            score: exam.score, // Include score
            createdAt: exam.createdAt, // Include the date for charting
        }));

        // console.log(resultsData); // Debugging

        res.json(resultsData);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch exam results', error: error.message });
    }
});









module.exports = {
    addExamResult,
    getUserExamResults,
    getAverageTimePerQuestion,
};
