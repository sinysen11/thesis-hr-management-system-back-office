const express = require('express');
const  postJobs = require('../../controllers/website/jobController');
const router = express.Router();

router.get('/', postJobs.getAllJobForWebsite);

module.exports = router;