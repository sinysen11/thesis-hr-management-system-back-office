const express = require('express');
const router = express.Router();
const leaveRequestController = require('../controllers/leaveRequestController');

router.get('/', leaveRequestController.getLeaveOwnerByUser);
router.post('/', leaveRequestController.createLeaveRequest);

module.exports = router;
