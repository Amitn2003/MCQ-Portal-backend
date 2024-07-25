const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    questions: [
        {
            question: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Question', 
                required: true 
            },
            selectedAnswer: { 
                type: Number, 
                required: true 
            },
        },
    ],
    score: {
        type: Number,
        required: true,
    },
    totalQuestions: {
        type: Number,
        required: true,
    },
    accuracy: {
        type: Number,
        required: true,
    },
    timeTaken: {  // New field for storing time taken
        type: Number,
        required: true,
    },
    topics: [String],  // New field for storing topics covered
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const ExamResult = mongoose.model('ExamResult', examResultSchema);

module.exports = ExamResult;
