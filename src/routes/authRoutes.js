const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const  usersController = require('../controllers/usersController');

const router = express.Router();

router.post('/login', authController.login);
router.post('/verify-token', verifyToken, authController.verifyTokenRoute);
router.post("/forgot-password", usersController.forgotPassword);
router.post("/reset-password", usersController.resetPassword);

module.exports = router;