const express = require('express');
const router = express.Router();
const mail = require('../controllers/mailController');

router.post('/', mail.sendApplyJobMail);

module.exports = router;