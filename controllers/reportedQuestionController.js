const asyncHandler = require('express-async-handler');
const ReportedQuestion = require('../models/reportedQuestionModel');
console.log("Reported qs page", ReportedQuestion)

// @desc    Report a question
// @route   POST /api/reportedQuestions
// @access  Private
const reportQuestion = asyncHandler(async (req, res) => {
    console.log("Request qs func runn")
    try {
        console.log(" User is ...", req.body)
        const { questionId, reason } = req.body;

        const reportedQuestion = await new ReportedQuestion({
            question: questionId,
            user: req.user._id,
            reason,
        });

        console.log("Reported question", reportedQuestion);

        const createdReportedQuestion = await reportedQuestion.save();

        res.status(201).json(createdReportedQuestion);
    } catch (error) {
        console.error("Error reporting question:", error);
        res.status(500).json({ message: "Failed to report question", error: error.message });
    }
});






// @desc    Get all reported questions
// @route   GET /api/reportedQuestions
// @access  Private/Admin
const getReportedQuestions = asyncHandler(async (req, res) => {
    const reportedQuestions = await ReportedQuestion.find({})
        .populate('question', 'question options correctAnswer explanation')
        .populate('user', 'name email');

    res.json(reportedQuestions);
});


const updateReportedQuestionStatus = asyncHandler(async (req, res) => {
    const reportedQuestion = await ReportedQuestion.findById(req.params.id);

    if (reportedQuestion) {
        reportedQuestion.status = req.body.status || reportedQuestion.status;

        const updatedReportedQuestion = await reportedQuestion.save();
        res.json(updatedReportedQuestion);
    } else {
        res.status(404);
        throw new Error('Reported question not found');
    }
});






module.exports = {  reportQuestion, getReportedQuestions, updateReportedQuestionStatus };
