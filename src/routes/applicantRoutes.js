const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicantController');

router.get('/', applicantController.getAllApplyJobs);

module.exports = router;
