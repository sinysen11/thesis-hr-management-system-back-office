const express = require('express');
const  submitJob = require('../../controllers/website/submitJobController');
const router = express.Router();

router.post('/', submitJob.submit);
router.get('/:applicant_id', submitJob.getApplyJobs);

module.exports = router;