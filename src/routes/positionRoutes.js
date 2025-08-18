const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');

router.post('/', positionController.createPosition);
router.get('/', positionController.getPositions);
router.get('/:id', positionController.getPositionById);
router.post('/:id', positionController.updatePosition);
router.post('/delete/:id', positionController.deletePosition);

module.exports = router;