const express = require('express');
const  applicantController = require('../../controllers/website/applicantController');

const router = express.Router();

router.post('/register', applicantController.registerApplicant);
router.post('/login', applicantController.loginApplicant);
router.post("/forgot-password", applicantController.forgotPassword);
router.post("/reset-password", applicantController.resetPassword);
router.get("/info/:id", applicantController.getApplicantInfo);
module.exports = router;