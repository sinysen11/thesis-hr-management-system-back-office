const MainContent = require("../models/mainContent");

exports.createMainContent = async (req, res) => {
  try {
    const content = new MainContent(req.body);
    await content.save();
    res.status(201).json({ status: 1, message: "Main content created", data: content });
  } catch (error) {
    res.status(500).json({ status: 0, message: error.message });
  }
};

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

exports.getMainContentById = async (req, res) => {
  try {
    const content = await MainContent.findById(req.params.id);
    if (!content || content.status === "DELETED")
      return res.status(404).json({ status: 0, message: "Not found" });
    res.json({ status: 1, data: content });
  } catch (error) {
    res.status(500).json({ status: 0, message: error.message });
  }
};

exports.updateMainContent = async (req, res) => {
  try {
    const content = await MainContent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!content || content.status === "DELETED")
      return res.status(404).json({ status: 0, message: "Not found" });
    res.json({ status: 1, message: "Updated successfully", data: content });
  } catch (error) {
    res.status(500).json({ status: 0, message: error.message });
  }
};

exports.softDeleteMainContent = async (req, res) => {
  try {
    const content = await MainContent.findByIdAndUpdate(
      req.params.id,
      { status: "DELETED" },
      { new: true }
    );
    if (!content) return res.status(404).json({ status: 0, message: "Not found" });
    res.json({ status: 1, message: "Main content soft deleted", data: content });
  } catch (error) {
    res.status(500).json({ status: 0, message: error.message });
  }
};
