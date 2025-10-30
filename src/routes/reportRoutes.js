const express = require('express');
const router = express.Router();
const leaveReport = require('../controllers/leaveReportController');

router.get('/approver', leaveReport.getLeaveRequestsReportForApprover);
router.get('/reports', leaveReport.getLeaveRequestsReport);
router.get('/requests', leaveReport.getLeaveSummaryAndAuditReport);
router.get('/history/:employeeId', leaveReport.getEmployeeLeaveHistory);
router.get('/balances', leaveReport.getLeaveBalanceAndLiabilityReport);
router.get('/departmental', leaveReport.getDepartmentWiseLeaveReport);

module.exports = router