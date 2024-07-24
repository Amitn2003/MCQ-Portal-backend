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
    // const { category } = req.query;
    const { category, subcategory } = req.query;
    console.log(req.query, req.subcategory)
    const totalQuestions = parseInt(req.query.totalQuestions, 10);
    console.log("totalQuestionst", totalQuestions)
    // try {
    //     let questions;

    //     if (category) {
    //         // Fetch all questions of the specified category
    //         questions = await Question.aggregate([
    //             { $match: { category: category } }, // Match questions of the specified category
    //             { $sample: { size: totalQuestions } } // Randomly sample 'totalQuestions' number of questions
    //         ]);
    //         // console.log("Qs ",questions)
    //     } else {
    //         // Fetch all questions regardless of category
    //         questions = await Question.aggregate([
    //             { $sample: { size: totalQuestions } } // Randomly sample 'totalQuestions' number of questions
    //         ]);
    //     }

    //     res.json(questions);
    // } catch (err) {
    //     // Handle errors
    //     console.error("Error fetching random questions:", err);
    //     res.status(500).json({ message: "Failed to fetch random questions." });
    // }
    try {
        let matchCriteria = {};
        
        if (category) {
            matchCriteria.category = category;
        }

        if ( subcategory && subcategory != "All") {
            matchCriteria.subcategory = subcategory;
        }
        console.log(matchCriteria)

        let questions = await Question.aggregate([
            { $match: matchCriteria }, // Match questions based on category and subcategory
            { $sample: { size: totalQuestions } } // Randomly sample 'totalQuestions' number of questions
        ]);

        res.json(questions);
    } catch (err) {
        console.error("Error fetching questions:", err);
        res.status(500).json({ message: "Failed to fetch questions." });
    }
});















// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Admin
// const updateQuestion = asyncHandler(async (req, res) => {
//     const questionData = questionSchema.parse(req.body);
//     const question = await Question.findById(req.params.id);

//     if (question) {
//         question.category = questionData.category;
//         question.question = questionData.question;
//         question.options = questionData.options;
//         question.correctAnswer = questionData.correctAnswer;
//         question.explanation = questionData.explanation;

//         const updatedQuestion = await question.save();
//         res.json(updatedQuestion);
//     } else {
//         res.status(404);
//         throw new Error('Question not found');
//     }
// });

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
// const deleteQuestion = asyncHandler(async (req, res) => {
//     const question = await Question.findById(req.params.id);

//     if (question) {
//         await Question.findByIdAndDelete(req.params.id);
//         res.json({ message: 'Question removed' });
//     } else {
//         res.status(404);
//         throw new Error('Question not found');
//     }
// });
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


// @desc    Add a question
// @route   POST /api/questions
// @access  Private/Admin
// const addQuestion = asyncHandler(async (req, res) => {
//     const { category, question, options, correctAnswer, explanation } = req.body;

//     const newQuestion = new Question({
//         category,
//         question,
//         options,
//         correctAnswer,
//         explanation,
//     });

//     const createdQuestion = await newQuestion.save();
//     res.status(201).json(createdQuestion);
// });






// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Admin
const updateQuestion = asyncHandler(async (req, res) => {
    const { category, question, options, correctAnswer, explanation } = req.body;

    const questionToUpdate = await Question.findById(req.params.id);

    if (questionToUpdate) {
        questionToUpdate.category = category || questionToUpdate.category;
        questionToUpdate.question = question || questionToUpdate.question;
        questionToUpdate.options = options || questionToUpdate.options;
        questionToUpdate.correctAnswer = correctAnswer || questionToUpdate.correctAnswer;
        questionToUpdate.explanation = explanation || questionToUpdate.explanation;

        const updatedQuestion = await questionToUpdate.save();
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
    const questionToDelete = await Question.findById(req.params.id);

    if (questionToDelete) {
        await questionToDelete.remove();
        res.json({ message: 'Question removed' });
    } else {
        res.status(404);
        throw new Error('Question not found');
    }
});





module.exports = {
    addQuestion,
    getQuestions,
    updateQuestion,
    deleteQuestion,
    getRandomQuestions
};
