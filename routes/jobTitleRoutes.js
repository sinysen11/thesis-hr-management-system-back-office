const express = require('express');
const router = express.Router();
const jobTitleController = require('../controllers/jobTitleController');

router.post('/', jobTitleController.createJobTitle);
router.get('/', jobTitleController.getAllJobTitles);
router.get('/:id', jobTitleController.getJobTitleById);
router.put('/:id', jobTitleController.updateJobTitle);
router.delete('/:id', jobTitleController.deleteJobTitle);

module.exports = router;
