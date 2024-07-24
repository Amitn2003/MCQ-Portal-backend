const express = require('express');
const { addExamResult, getUserExamResults } = require('../controllers/examResultController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/')
.post(protect, addExamResult)
.get(protect, getUserExamResults);

module.exports = router;
