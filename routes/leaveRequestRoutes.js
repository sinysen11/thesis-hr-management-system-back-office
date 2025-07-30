const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveRequestController');

router.post('/', leaveController.createLeaveRequest);
router.patch('/:request_id/status', leaveController.updateLeaveStatus);

module.exports = router;
