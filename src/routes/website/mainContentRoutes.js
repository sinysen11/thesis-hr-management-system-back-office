const express = require("express");
const router = express.Router();
const mainContentCtrl = require("../../controllers/website/mainContentController");

router.get("/main-content", mainContentCtrl.getAllMainContent);
router.get("/main-content/tabs/:mainContentId", mainContentCtrl.getTabsByMainContent);

module.exports = router;
