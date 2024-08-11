const express = require('express');
const { registerUser, authUser, googleLogin  } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/google', googleLogin);
module.exports = router;
