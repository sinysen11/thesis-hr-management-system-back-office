const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicantController');

router.get('/', applicantController.getAllApplyJobs);
router.get('/:id', applicantController.getApplyJobById);
router.post('/update/:id', applicantController.updateApplyJobStatus);

module.exports = router;
