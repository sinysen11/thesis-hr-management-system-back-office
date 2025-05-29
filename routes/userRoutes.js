const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', authController.login);
router.post('/create-user', authController.createUser);

router.get('/profile', verifyToken, (req, res) => {
  res.json({ message: 'Welcome to your profile', user: req.user });
});

router.get('/admin', verifyToken, requireRole('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin!' });
});

module.exports = router;
