const express = require('express');
const { addExamResult, getUserExamResults, getAverageTimePerQuestion  } = require('../controllers/examResultController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/')
.post(protect, addExamResult)
.get(protect, getUserExamResults);


router.get('/averageTimePerQuestion', protect, getAverageTimePerQuestion);



module.exports = router;
