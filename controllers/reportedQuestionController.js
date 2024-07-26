const asyncHandler = require('express-async-handler');
const ReportedQuestion = require('../models/reportedQuestionModel');
const Question = require('../models/questionModel');
const ExamResult = require('../models/examResultModel');
// console.log("Reported qs page", ReportedQuestion)

// @desc    Report a question
// @route   POST /api/reportedQuestions
// @access  Private
const reportQuestion = asyncHandler(async (req, res) => {
    console.log("Request qs func runn")
    try {
        // console.log(" User is ...", req.body)
        const { questionId, reason } = req.body;

        const reportedQuestion = await new ReportedQuestion({
            question: questionId,
            user: req.user._id,
            reason,
        });

        // console.log("Reported question", reportedQuestion);

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

    if (!reportedQuestion) {
        res.status(404).send('Reported question not found');
        throw new Error('Reported question not found');
    }

    if (reportedQuestion) {
        reportedQuestion.status = req.body.status || reportedQuestion.status;

        const question = await Question.findById(reportedQuestion.question._id);

        if (!question) {
            res.status(404);
            throw new Error('Question not found');
        }

        // Check if the correct answer is changed
    const originalCorrectAnswer = question.correctAnswer;
    const isCorrectAnswerChanged = originalCorrectAnswer !== req.body.correctAnswer;



        if (question) {
            question.question = req.body.question || question.question;
            question.options = req.body.options || question.options;
            question.correctAnswer = req.body.correctAnswer || question.correctAnswer;
            question.explanation = req.body.explanation || question.explanation;

            await question.save();
        }

        const updatedReportedQuestion = await reportedQuestion.save();

        // If the correct answer has changed, update all related exam results
    if (isCorrectAnswerChanged) {
        await updateExamResultsForQuestion(question._id, question.correctAnswer);
    }

    // Save the updated reported question
    //const updatedReportedQuestion = await reportedQuestion.save();


    
        res.json(updatedReportedQuestion);
    } else {
        res.status(404);
        throw new Error('Reported question not found');
    }
});

// Function to update all exam results for a specific question
const updateExamResultsForQuestion = async (questionId, newCorrectAnswer) => {
    try {
        // Find all exam results containing the updated question
        const examResults = await ExamResult.find({ 'questions.question': questionId });
        console.log(examResults)

        // Update each exam result
        for (const examResult of examResults) {
            let correctAnswersCount = 0;

            // Recalculate the score and accuracy
            for (const question of examResult.questions) {
                if (question.question.toString() === questionId.toString()) {
                    if (question.selectedAnswer === newCorrectAnswer) {
                        correctAnswersCount++;
                    }
                } else {
                    const correctOption = await Question.findById(question.question).select('correctAnswer');
                    if (question.selectedAnswer === correctOption.correctAnswer) {
                        correctAnswersCount++;
                    }
                }
            }

            // Update the score and accuracy of the exam result
            examResult.score = correctAnswersCount;
            examResult.accuracy = (correctAnswersCount / examResult.totalQuestions) * 100;

            // Set a default timeTaken if not already set
            examResult.timeTaken = examResult.timeTaken || 2;
            
            console.log(examResults)

            // Save the updated exam result
            await examResult.save();
        }
    } catch (error) {
        console.error('Failed to update exam results:', error);
    }
};



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
