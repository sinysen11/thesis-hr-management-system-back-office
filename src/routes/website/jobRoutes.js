const express = require('express');
const  postJobs = require('../../controllers/website/jobController');
const router = express.Router();

router.get('/', postJobs.getAllJobForWebsite);
router.get('/:job_id', postJobs.getJobForWebsiteById);

module.exports = router;