const express = require("express");
const router = express.Router();
const mainContentCtrl = require("../../controllers/website/mainContentController");
const imageCtrl = require('../../controllers/imageController');

router.get("/main-content", mainContentCtrl.getAllMainContent);
router.get("/main-content/tabs/:mainContentId", mainContentCtrl.getTabsByMainContent);
router.get('/images/:id', imageCtrl.getImageById);

module.exports = router;
