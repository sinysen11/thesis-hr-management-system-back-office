const MainContent = require("../../models/mainContent");
const MainContentTab = require("../../models/tabContent");

exports.getAllMainContent = async (req, res) => {
  try {
    const filter = { status: "ACTIVE" };
    if (req.query.type) filter.type = req.query.type;

    const contents = await MainContent.find(filter).sort({ createdAt: -1 });
    res.json({ status: 1, data: contents });
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
