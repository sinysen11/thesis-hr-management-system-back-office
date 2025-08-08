const express = require('express');
const multer = require('multer');
const  submitJob = require('../../controllers/website/submitJobController');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('resume'), submitJob.submit);
router.get('/:applicant_id', submitJob.getApplyJobs);

module.exports = router;