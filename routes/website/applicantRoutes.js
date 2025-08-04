const express = require('express');
const  applicantController = require('../../controllers/website/applicantController');

const router = express.Router();

router.post('/register', applicantController.registerApplicant);
router.post('/login', applicantController.loginApplicant);

module.exports = router;