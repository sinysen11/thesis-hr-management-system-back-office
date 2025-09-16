const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const imageCtrl = require('../controllers/imageController');

router.post('/', upload.single('image'), imageCtrl.uploadImage);

module.exports = router;
