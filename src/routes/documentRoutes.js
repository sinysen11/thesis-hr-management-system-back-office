const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentsController');

router.post('/', documentController.uploadDocuments);
router.get('/:_id', documentController.getDocumentById);

module.exports = router;