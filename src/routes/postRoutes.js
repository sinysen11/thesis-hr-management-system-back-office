const express = require('express');
const router = express.Router();
const postJobController = require('../controllers/postJobController');

router.post('/', postJobController.createPostJob);
router.get('/', postJobController.getAllPostJobs);
router.get('/:id', postJobController.getPostJobById);
router.put('/:id', postJobController.updatePostJob);
router.delete('/:id', postJobController.deletePostJob);

module.exports = router;
