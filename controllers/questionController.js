const asyncHandler = require('express-async-handler');
const Question = require('../models/questionModel');
const { z } = require('zod');

const questionSchema = z.object({
    category: z.string().min(1),
    question: z.string().min(1),
    options: z.array(z.string().min(1)).length(4),
    correctAnswer: z.number().min(0).max(3),
    explanation: z.string().optional(),
});

// @desc    Add a new question
// @route   POST /api/questions
// @access  Private/Admin
const addQuestion = asyncHandler(async (req, res) => {
    const questionData = questionSchema.parse(req.body);

    const question = await Question.create(questionData);

    res.status(201).json(question);
});

// @desc    Get all questions or by category
// @route   GET /api/questions
// @access  Private

// const getQuestions = asyncHandler(async (req, res) => {
//     console.log(req.query)
//     const { category } = req.query;
//     let questions;
//     if (category) {
//         questions = await Question.find({ category });
//     } else {
//         questions = await Question.find({});
//     }
//     res.json(questions);
// });
const getQuestions = asyncHandler(async (req, res) => {
    const { category } = req.query;
    console.log(req.query)
    const totalQuestions = parseInt(req.query.totalQuestions, 10);
    console.log("totalQuestionst", totalQuestions)
    try {
        let questions;

        if (category) {
            // Fetch all questions of the specified category
            questions = await Question.aggregate([
                { $match: { category: category } }, // Match questions of the specified category
                { $sample: { size: totalQuestions } } // Randomly sample 'totalQuestions' number of questions
            ]);
            console.log("Qs ",questions)
        } else {
            // Fetch all questions regardless of category
            questions = await Question.aggregate([
                { $sample: { size: totalQuestions } } // Randomly sample 'totalQuestions' number of questions
            ]);
        }

        res.json(questions);
    } catch (err) {
        // Handle errors
        console.error("Error fetching random questions:", err);
        res.status(500).json({ message: "Failed to fetch random questions." });
    }
});















// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Admin
const updateQuestion = asyncHandler(async (req, res) => {
    const questionData = questionSchema.parse(req.body);
    const question = await Question.findById(req.params.id);

    if (question) {
        question.category = questionData.category;
        question.question = questionData.question;
        question.options = questionData.options;
        question.correctAnswer = questionData.correctAnswer;
        question.explanation = questionData.explanation;

        const updatedQuestion = await question.save();
        res.json(updatedQuestion);
    } else {
        res.status(404);
        throw new Error('Question not found');
    }
});

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
const deleteQuestion = asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);

    if (question) {
        await Question.findByIdAndDelete(req.params.id);
        res.json({ message: 'Question removed' });
    } else {
        res.status(404);
        throw new Error('Question not found');
    }
});
// @desc    Get random questions
// @route   GET /api/questions/random/:totalQs
// @access  Private
const getRandomQuestions = asyncHandler(async (req, res) => {
    console.log("Get random qs")
    const totalQs = parseInt(req.params.totalQs, 10);
    console.log("Get random qs", totalQs)
    const questions = await Question.aggregate([{ $sample: { size: totalQs } }]);
    console.log("Get random qs", questions)
    res.json(questions);
});

module.exports = {
    addQuestion,
    getQuestions,
    updateQuestion,
    deleteQuestion,
    getRandomQuestions
};
