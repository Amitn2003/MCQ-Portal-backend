const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const checkExamLimit = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    
    if (user.isPremium) {
        return next();
    }

    const today = new Date().toISOString().split('T')[0];

    let attemptsToday = user.examAttempts.find(attempt => attempt.date.toISOString().split('T')[0] === today);

    if (!attemptsToday) {
        attemptsToday = { date: new Date(), count: 0 };
        user.examAttempts.push(attemptsToday);
    }

    if (attemptsToday.count >= 5) {
        res.status(403);
        throw new Error('Normal users can only take 5 exams per day. Upgrade to premium for unlimited exams.');
    } else {
        attemptsToday.count += 1;
        await user.save();
        next();
    }
});

module.exports = { checkExamLimit };
