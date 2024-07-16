const express = require('express');
const router = express.Router();
// const asyncHandler = require('express-async-handler');
const {
    reportQuestion,
    getReportedQuestions,
    updateReportedQuestionStatus,
} = require('../controllers/reportedQuestionController');
const { protect , admin} = require('../middlewares/authMiddleware');





router.route('/').post(protect, reportQuestion)
.get(protect, admin, getReportedQuestions);
router.route('/:id').put(protect, admin, updateReportedQuestionStatus);
// router.route('/').post(protect, reportQuestion);

module.exports = router;
