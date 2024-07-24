const mongoose = require('mongoose');

const examSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question',
            },
        ],
        dueDate: {
            type: Date,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        
        timeTaken: {
            type: Number, 
            default: 0, 
        },
    },
    {
        timestamps: true,
    }
);

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;
