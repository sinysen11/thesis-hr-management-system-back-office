const express = require('express');
const router = express.Router();
const multer = require('multer');
const imageCtrl = require('../controllers/imageController');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('image'), imageCtrl.uploadImage);
router.get('/:id', imageCtrl.getImageById);

module.exports = router;
