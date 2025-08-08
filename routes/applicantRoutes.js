const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicantController');

router.get('/', applicantController.getAllApplyJobs);
router.get('/:submit_id/document', applicantController.getResume);

module.exports = router;
