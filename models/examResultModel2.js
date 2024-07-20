const mongoose = require('mongoose');

const examResultSchema2 = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exam',
            required: true,
        },
        answers: [
            {
                question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
                selectedAnswer: { type: Number, required: true },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const ExamResult2 = mongoose.model('ExamResult2', examResultSchema2);

module.exports = ExamResult2;
