const express = require('express');
const router = express.Router();
const publicHolidayController = require('../controllers/publicHolidayController');

router.post('/', publicHolidayController.createPublicHoliday);
router.get('/', publicHolidayController.getPublicHolidays);
router.get('/date', publicHolidayController.getHolidayDates);
router.get('/:id', publicHolidayController.getPublicHolidayById);
router.post('/update/:id', publicHolidayController.updatePublicHoliday);
router.post('/delete/:id', publicHolidayController.deletePublicHoliday);

module.exports = router;
