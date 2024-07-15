const express = require('express');
const {
    addQuestion,
    getQuestions,
    updateQuestion,
    deleteQuestion,
    getRandomQuestions
} = require('../controllers/questionController');
const { protect, admin } = require('../middlewares/authMiddleware');
const router = express.Router();





router.route('/random/:totalQs').get(protect, getRandomQuestions);
router.route('/')
    .post(protect, admin, addQuestion)
    .get(protect, getQuestions);

router.route('/:id')
    .put(protect, admin, updateQuestion)
    .delete(protect, admin, deleteQuestion);

module.exports = router;
