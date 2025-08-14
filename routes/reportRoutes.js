
const express = require('express');
const router = express.Router();
const leaveReport = require('../controllers/leaveReportController');

router.get('/approver', leaveReport.getLeaveRequestsReportForApprover);
router.get('/reports', leaveReport.getLeaveRequestsReport);

module.exports = router