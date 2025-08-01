const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveRequestController');

router.post('/', leaveController.createLeaveRequest);
router.get('/', leaveController.getLeaveRequests);
router.post('/:request_id', leaveController.updateLeaveStatus);

module.exports = router;
