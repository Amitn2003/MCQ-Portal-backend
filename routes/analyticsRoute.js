const express = require('express');
const { getUserAnalytics , getUserPerformanceBySubcategory } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/user').get(protect, getUserAnalytics);
router.route('/subcategory').get(protect, getUserPerformanceBySubcategory );

module.exports = router;
