const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicantController');
const documentsController = require('../controllers/documentsController');

router.get('/', applicantController.getAllApplyJobs);
router.get('/:id', applicantController.getApplyJobById);
router.post('/update/:id', applicantController.updateApplyJobStatus);
router.get('/:_id/document', documentsController.getDocumentById)

module.exports = router;
