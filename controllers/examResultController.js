const asyncHandler = require('express-async-handler');
const ExamResult = require('../models/examResultModel');

// @desc    Create new exam result
// @route   POST /api/examResults
// @access  Private
const addExamResult = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    try {
        const { questions, score, totalQuestions, accuracy } = req.body;
        console.log("exam result controller", req.body);

        // Filter out questions with null selectedAnswer
        const validQuestions = questions.filter(question => question.selectedAnswer !== null);
        console.log("Valid qs", validQuestions)

        const examResult = new ExamResult({
            user: req.user._id,
            questions: validQuestions,
            score,
            totalQuestions,
            accuracy,
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
    const examResults = await ExamResult.find({ user: req.user._id }).populate('questions.question');

    res.json(examResults);
});

module.exports = {
    addExamResult,
    getUserExamResults,
};
