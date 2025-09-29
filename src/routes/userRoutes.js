const express = require('express');
const  usersController = require('../controllers/usersController');
const leaveBalance = require('../controllers/leaveBalanceController');

const router = express.Router();

router.post('/create', usersController.createUser);
router.post('/update-info', usersController.updateUserInfo);
router.post('/change-password', usersController.changePassword);
router.post('/update-status', usersController.updateStatus);
router.get('/', usersController.getUsers);
router.get('/:user_id', leaveBalance.getLeaveBalanceByUserId);
router.get('/info/:id', usersController.getUserById);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;
