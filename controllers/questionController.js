const asyncHandler = require('express-async-handler');
const Question = require('../models/questionModel');
const { z } = require('zod');
const ExamResult = require("../models/examResultModel")



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
// const addQuestion = asyncHandler(async (req, res) => {
//     const questionData = questionSchema.parse(req.body);

//     const question = await Question.create(questionData);

//     res.status(201).json(question);
// });

// @desc    Get all questions or by category
// @route   GET /api/questions
// @access  Private

const getQuestions = asyncHandler(async (req, res) => {
    // const { category } = req.query;
    const { category, subcategory } = req.query;
    console.log(req.query, req.subcategory)
    let totalQuestions = parseInt(req.query.totalQuestions, 10);
    // If totalQuestions is NaN or not provided, set default to 10
    if (isNaN(totalQuestions) || totalQuestions <= 0) {
        totalQuestions = 10;
    }
    console.log("totalQuestions", totalQuestions)
    
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
            { $match: matchCriteria }, 
            { $sample: { size: totalQuestions } } 
        ]);

        res.json(questions);
    } catch (err) {
        console.error("Error fetching questions:", err);
        res.status(500).json({ message: "Failed to fetch questions." });
    }
});




// @desc    Get questions by category and subcategory, or search by text
// @route   GET /api/questions
// @access  Private/Admin
const getQuestionsSearch = asyncHandler(async (req, res) => {
    const { category, subcategory, search } = req.query;
    let filter = {};

    if (category && category !== "All") filter.category = category;
    if (subcategory && category !== "All") filter.subcategory = subcategory;
    if (search) filter.question = { $regex: search, $options: 'i' }; // Case-insensitive search

    try {
        const questions = await Question.find(filter);
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch questions', error: error.message });
    }
});
// @desc    Add a new question
// @route   POST /api/questions
// @access  Private/Admin
const addQuestion = asyncHandler(async (req, res) => {
    const { question, options, correctAnswer, category, subcategory, explanation } = req.body;

    try {
        const newQuestion = new Question({
            question,
            options,
            correctAnswer,
            category,
            subcategory,
            explanation
        });

        const createdQuestion = await newQuestion.save();
        res.status(201).json(createdQuestion);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add question', error: error.message });
    }
});
// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Admin
const updateQuestion = asyncHandler(async (req, res) => {
    const { question, options, correctAnswer, category, subcategory, explanation } = req.body;
    console.log({ question, options, correctAnswer, category, subcategory, explanation })

    try {
        const existingQuestion = await Question.findById(req.params.id);

        if (!existingQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const originalCorrectAnswer = existingQuestion.correctAnswer;
        const isCorrectAnswerChanged = originalCorrectAnswer !== correctAnswer;

        existingQuestion.question = question;
        existingQuestion.options = options;
        existingQuestion.correctAnswer = correctAnswer;
        existingQuestion.category = category;
        existingQuestion.subcategory = subcategory;
        existingQuestion.explanation = explanation;

        const updatedQuestion = await existingQuestion.save();
        // Trigger result update if the correct answer has changed
        if (isCorrectAnswerChanged) {
            console.log("answer changed")
            await updateExamResultsForQuestion(updatedQuestion._id, correctAnswer);
        }
        console.log("answer not changed")
        console.log(updatedQuestion)
        res.json(updatedQuestion);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update question', error: error.message });
    }
});




// Function to update all exam results for a specific question
const updateExamResultsForQuestion = async (questionId, newCorrectAnswer) => {
    try {
        // Find all exam results containing the updated question
        const examResults = await ExamResult.find({ 'questions.question': questionId });
        console.log("Exam result update call", examResults)

        examResults.forEach(async (examResult) => {
            // Calculate the new score
            let correctAnswersCount = 0;
            examResult.questions.forEach(async (question) => {
                if (question.question.toString() === questionId.toString()) {
                    // Check if the user's selected answer matches the new correct answer
                    if (question.selectedAnswer === newCorrectAnswer) {
                        correctAnswersCount++;
                    }
                } else {
                    // Check if previously correct questions are still correct
                    const correctOption = await Question.findById(question.question).select('correctAnswer');
                    if (question.selectedAnswer === correctOption.correctAnswer) {
                        correctAnswersCount++;
                    }
                }
            });

            // Update score and accuracy
            examResult.score = correctAnswersCount;
            examResult.accuracy = (correctAnswersCount / examResult.totalQuestions) * 100;

            // Save updated exam result
            await examResult.save();
        });
        console.log(examResults)
    } catch (error) {
        console.error('Failed to update exam results:', error);
    }
};




// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
const deleteQuestion = asyncHandler(async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        await question.deleteOne();
        res.json({ message: 'Question removed' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete question', error: error.message });
    }
});










const getRandomQuestions = asyncHandler(async (req, res) => {
    console.log("Get random qs")
    const totalQs = parseInt(req.params.totalQs, 10);
    console.log("Get random qs", totalQs)
    const questions = await Question.aggregate([{ $sample: { size: totalQs } }]);
    console.log("Get random qs", questions)
    res.json(questions);
});







// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Admin
// const updateQuestion = asyncHandler(async (req, res) => {
//     const { category, question, options, correctAnswer, explanation } = req.body;

//     const questionToUpdate = await Question.findById(req.params.id);

//     if (questionToUpdate) {
//         questionToUpdate.category = category || questionToUpdate.category;
//         questionToUpdate.question = question || questionToUpdate.question;
//         questionToUpdate.options = options || questionToUpdate.options;
//         questionToUpdate.correctAnswer = correctAnswer || questionToUpdate.correctAnswer;
//         questionToUpdate.explanation = explanation || questionToUpdate.explanation;

//         const updatedQuestion = await questionToUpdate.save();
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
//     const questionToDelete = await Question.findById(req.params.id);

//     if (questionToDelete) {
//         await questionToDelete.remove();
//         res.json({ message: 'Question removed' });
//     } else {
//         res.status(404);
//         throw new Error('Question not found');
//     }
// });





module.exports = {
    addQuestion,
    getQuestions,
    getQuestionsSearch,
    updateQuestion,
    deleteQuestion,
    getRandomQuestions
};
