const express = require('express');
const { addExamResult, getUserExamResults, getAverageTimePerQuestion ,getExamResultById  } = require('../controllers/examResultController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/')
.post(protect, addExamResult)
.get(protect, getUserExamResults);


router.get('/averageTimePerQuestion', protect, getAverageTimePerQuestion);
router.get('/:resultId', protect, getExamResultById);


module.exports = router;
