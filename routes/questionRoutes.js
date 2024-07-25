const express = require('express');
const {
    addQuestion,
    getQuestions,
    updateQuestion,
    deleteQuestion,
    getRandomQuestions,
    getQuestionsSearch
} = require('../controllers/questionController');
const { checkExamLimit } = require('../middlewares/examLimitMiddleware');
const { protect, admin } = require('../middlewares/authMiddleware');
const router = express.Router();





router.route('/random/:totalQs').get(protect, getRandomQuestions);

router.route('/')
    .post(protect, admin, addQuestion)
    .get(protect, checkExamLimit, getQuestions);  

router.route("/search")
    .get(protect, admin, getQuestionsSearch)

router.route('/:id')
    .put(protect, admin, updateQuestion)
    .delete(protect, admin, deleteQuestion);

module.exports = router;
