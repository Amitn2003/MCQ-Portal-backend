const asyncHandler = require('express-async-handler');
const Exam = require('../models/examModel');
const User = require('../models/userModel');
const ExamResult2 = require('../models/examResultModel2');
const Question = require("../models/questionModel")
// @desc    Create a new exam
// @route   POST /api/exams
// @access  Private/Admin
const createExam = asyncHandler(async (req, res) => {
    const { title, category, questions, dueDate } = req.body;

    const exam = new Exam({
        title,
        category,
        questions,
        dueDate,
        createdBy: req.user._id,
    });

    const createdExam = await exam.save();
    const users = await User.find();
    for (let user of users) {
        user.notifications.push({ message: `New exam "${title}" available in category "${category}".` });
        await user.save();
    }
    res.status(201).json(createdExam);
});



// @desc    Get all exams available for the user
// @route   GET /api/exams/available
// @access  Private
const getAvailableExams = asyncHandler(async (req, res) => {
    const exams = await Exam.find({ dueDate: { $gte: new Date() } });
    res.json(exams);
});





// @desc    Get all exams
// @route   GET /api/exams
// @access  Private
const getExams = asyncHandler(async (req, res) => {
    const exams = await Exam.find({});
    res.json(exams);
});

// @desc    Get exam by ID
// @route   GET /api/exams/:id
// @access  Private
const getExamById = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id).populate('questions');

    if (exam) {
        res.json(exam);
    } else {
        res.status(404);
        throw new Error('Exam not found');
    }
});

// @desc    Delete an exam
// @route   DELETE /api/exams/:id
// @access  Private/Admin
const deleteExam = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id);

    if (exam) {
        await exam.deleteOne();
        res.json({ message: 'Exam removed' });
    } else {
        res.status(404);
        throw new Error('Exam not found');
    }
});

// @desc    Submit an exam
// @route   POST /api/exams/:id/submit
// @access  Private
const submitExam = asyncHandler(async (req, res) => {
    const { answers } = req.body;
    const exam = await Exam.findById(req.params.id);
    console.log(answers, exam)

    if (!exam) {
        res.status(404);
        throw new Error('Exam not found');
    }

    if (new Date() > new Date(exam.dueDate)) {
        res.status(400);
        throw new Error('Exam due date has passed');
    }

    const result = new ExamResult2({
        user: req.user._id,
        exam: req.params.id,
        answers,
    });
    console.log("Result," , result)

    const createdResult = await result.save();
    console.log("Created result", createdResult)
    res.status(201).json(createdResult);
});

// @desc    Get user's exams and results
// @route   GET /api/exams/user/:userId
// @access  Private/Admin
const getUserExams = asyncHandler(async (req, res) => {
    try {
        // Find exam results for the user
        const results = await ExamResult2.find({ user: req.params.userId }).populate('exam');
        console.log("Results :" , results)

        // Manually populate the questions for each exam
        for (let result of results) {
            result.exam.questions = await Question.find({ _id: { $in: result.exam.questions } });
        }

        res.json(results);
    } catch (error) {
        res.status(404).json({message: "Server error!"});
        throw new Error('Results not found');
    }
});
// const getUserExams = asyncHandler(async (req, res) => {
//     // const results = await ExamResult.find({ user: req.params.userId }).populate({
//     //     path: 'exam',
//     //     populate: {
//     //         path: 'questions',
//     //         model: 'Question'
//     //     }
//     // });
//     console.log(req.params.userId)
//     const results = await ExamResult.find({ user: req.params.userId }).populate({
//         path: 'exam',
//         populate: {
//             path: 'questions',
//             model: 'Question'
//         }
//     });

//     console.log("Resultsssssssssssssss",results)

//     if (results) {
//         res.json(results);
//     } else {
//         res.status(404);
//         throw new Error('Results not found');
//     }
// });

module.exports = {
    createExam,
    getExams,
    getExamById,
    deleteExam,
    submitExam,
    getUserExams,
    getAvailableExams,
};
