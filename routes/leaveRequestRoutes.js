const express = require('express');
const router = express.Router();
const leaveRequestController = require('../controllers/leaveRequestController');

router.post('/', leaveRequestController.createPostJob);
router.get('/', leaveRequestController.getAllPostJobs);
router.get('/:id', leaveRequestController.getPostJobById);
router.put('/:id', leaveRequestController.updatePostJob);
router.delete('/:id', leaveRequestController.deletePostJob);

module.exports = router;
