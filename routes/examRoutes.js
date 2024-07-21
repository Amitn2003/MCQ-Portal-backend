const express = require('express');
const { protect, admin } = require('../middlewares/authMiddleware');
const { createExam, 
    getExams, 
    getExamById, 
    deleteExam, 
    submitExam, 
    getUserExams, 
    getAvailableExams,
    getUserExamAttemptsByDate, } = require('../controllers/examController');
const router = express.Router();





router.route('/')
    .post(protect, admin, createExam)
    .get(protect, getExams);


router.route('/available')
    .get(protect, getAvailableExams);


router.route('/:id')
    .get(protect, getExamById)
    .delete(protect, admin, deleteExam);

router.route('/:id/submit')
    .post(protect, submitExam);

router.route('/user/:userId')
    .get(protect,  getUserExams);



router.route('/user/:userId/attempts')
    .get(protect, getUserExamAttemptsByDate);

module.exports = router;
