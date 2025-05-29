const express = require('express');
const router = express.Router();
const controller = require('../controllers/leaveTypeController');

router.post('/', controller.createLeaveType);
router.get('/', controller.getLeaveTypes);
router.get('/:id', controller.getLeaveTypeById);
router.put('/:id', controller.updateLeaveType);
router.delete('/:id', controller.deleteLeaveType);

module.exports = router;
