const express = require('express');
const router = express.Router();
const activityLog = require('../controllers/activityLogController');

router.get('/', activityLog.getAllActivityLog);
router.get('/:id', activityLog.getActivityLogById);

module.exports = router;