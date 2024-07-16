const mongoose = require('mongoose');

const reportedQuestionSchema = new mongoose.Schema({
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'resolved'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

let ReportedQuestion ;
try {
    ReportedQuestion = mongoose.model('ReportedQuestion');
} catch (error) {
    console.log("Already exist")
    ReportedQuestion =  mongoose.model('ReportedQuestion', reportedQuestionSchema);
}
module.exports = ReportedQuestion;
