const express = require("express");
const router = express.Router();
const mainContentCtrl = require("../controllers/mainContentController");
const tabCtrl = require("../controllers/TabContentController");

// Main content routes
router.post("/main-content", mainContentCtrl.createMainContent);
router.get("/main-content", mainContentCtrl.getAllMainContent);
router.get("/main-content/:id", mainContentCtrl.getMainContentById);
router.post("/main-content/update/:id", mainContentCtrl.updateMainContent);
router.post("/main-content/delete/:id", mainContentCtrl.softDeleteMainContent);

// Tabs routes
router.post("/main-content/tabs", tabCtrl.createTab);
router.get("/main-content/tabs/:mainContentId", tabCtrl.getTabsByMainContent);
router.post("/main-content/tabs/update/:tabId", tabCtrl.updateTab);
router.post("/main-content/tabs/delete/:tabId", tabCtrl.softDeleteTab); 

module.exports = router;
