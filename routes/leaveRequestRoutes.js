const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveRequestController');

router.post('/', leaveController.createLeaveRequest);
router.get('/approver', leaveController.getAllApprover);
router.get('/:user_id', leaveController.getLeaveRequests);
router.get('/approver/:user_id', leaveController.getLeaveRequestsForApprover);
router.post('/:request_id', leaveController.updateLeaveStatus);

module.exports = router;
