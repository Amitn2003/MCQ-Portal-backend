const asyncHandler = require('express-async-handler');
const ReportedQuestion = require('../models/reportedQuestionModel');
const Question = require('../models/questionModel');
// console.log("Reported qs page", ReportedQuestion)

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
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

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





// @desc    Update reported question status and details
// @route   PUT /api/reportedQuestions/:id
// @access  Private/Admin
const updateReportedQuestion = asyncHandler(async (req, res) => {
    const reportedQuestion = await ReportedQuestion.findById(req.params.id);

    if (reportedQuestion) {
        reportedQuestion.status = req.body.status || reportedQuestion.status;

        const question = await Question.findById(reportedQuestion.question._id);
        if (question) {
            question.question = req.body.question || question.question;
            question.options = req.body.options || question.options;
            question.correctAnswer = req.body.correctAnswer || question.correctAnswer;
            question.explanation = req.body.explanation || question.explanation;

            await question.save();
        }

        const updatedReportedQuestion = await reportedQuestion.save();
        res.json(updatedReportedQuestion);
    } else {
        res.status(404);
        throw new Error('Reported question not found');
    }
});





// @desc    Delete reported question
// @route   DELETE /api/reportedQuestions/:id
// @access  Private/Admin
const deleteReportedQuestion = asyncHandler(async (req, res) => {
    console.log(req.params)
    const reportedQuestion = await ReportedQuestion.findById(req.params.id);
    console.log(reportedQuestion)

    if (!reportedQuestion) {
        res.status(404).json({ error: 'Reported question not found' });
        return;
    }

    try {
        let temp = await reportedQuestion.deleteOne();
        console.log("TEMPPP", temp)
        res.json({ message: 'Reported question removed' });
    } catch (error) {
        console.error('Error removing reported question:', error);
        res.status(500).json({ error: 'Failed to remove reported question' });
    }
});




module.exports = {  reportQuestion, getReportedQuestions, updateReportedQuestionStatus, updateReportedQuestion , deleteReportedQuestion };
