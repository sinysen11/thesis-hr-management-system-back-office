const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', authController.login);

router.get('/admin', verifyToken, requireRole('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin!' });
});

router.post('/verify-token', verifyToken, authController.verifyTokenRoute);

module.exports = router;
