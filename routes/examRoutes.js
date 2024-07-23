const express = require('express');
const { protect, admin } = require('../middlewares/authMiddleware');
const { createExam, 
    getExams, 
    getExamById, 
    updateExam,
    deleteExam, 
    submitExam, 
    getUserExams, 
    getAvailableExams,
    getUserExamAttemptsByDate,
    getAllUsersResults,
    getAllUserExamResults, } = require('../controllers/examController');
const router = express.Router();





router.route('/')
    .post(protect, admin, createExam)
    .get(protect, getExams);

router.route('/results')
        .get(protect, admin, getAllUsersResults);


router.route('/available')
    .get(protect, getAvailableExams);

router.route('/user/:userId')
        .get(protect,  getUserExams);

router.route('/:id')
    .get(protect, getExamById)
    .put(protect, admin, updateExam)
    .delete(protect, admin, deleteExam);
router.route('/:id/submit')
    .post(protect, submitExam);

router.route('/user/:userId/attempts')
    .get(protect, getUserExamAttemptsByDate);
        
        
router.route('/results/mock')
    .get(protect, admin, getAllUserExamResults);




module.exports = router;
