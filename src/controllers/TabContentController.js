const MainContentTab = require("../models/tabContent");

exports.createTab = async (req, res) => {
  try {
    const { mainContentId } = req.body;
    const tab = new MainContentTab({ ...req.body, mainContentId });
    await tab.save();
    res.status(201).json({ status: 1, message: "Tab created", data: tab });
  } catch (error) {
    res.status(500).json({ status: 0, message: error.message });
  }
};

exports.getTabsByMainContent = async (req, res) => {
  try {
    const { mainContentId } = req.params;
    const tabs = await MainContentTab.find({ mainContentId, status: "ACTIVE" })
    .populate('mainContentId');
    res.json({ status: 1, data: tabs });
  } catch (error) {
    res.status(500).json({ status: 0, message: error.message });
  }
};

exports.updateTab = async (req, res) => {
  try {
    const { tabId } = req.params;
    const tab = await MainContentTab.findOneAndUpdate(
      { _id: tabId, status: "ACTIVE" },
      req.body,
      { new: true, runValidators: true }
    );
    if (!tab) return res.status(404).json({ status: 0, message: "Tab not found" });
    res.json({ status: 1, message: "Tab updated", data: tab });
  } catch (error) {
    res.status(500).json({ status: 0, message: error.message });
  }
};

exports.softDeleteTab = async (req, res) => {
  try {
    const { tabId } = req.params;
    const tab = await MainContentTab.findOneAndUpdate(
      { _id: tabId },
      { status: "DELETED" },
      { new: true }
    );
    if (!tab) return res.status(404).json({ status: 0, message: "Tab not found" });
    res.json({ status: 1, message: "Tab soft deleted", data: tab });
  } catch (error) {
    res.status(500).json({ status: 0, message: error.message });
  }
};
