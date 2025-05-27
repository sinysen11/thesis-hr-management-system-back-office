const JobTitle = require('../models/jobTitle');

// CREATE
exports.createJobTitle = async (req, res) => {
  try {
    const title = new JobTitle(req.body);
    const data = await title.save();
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET ALL
exports.getAllJobTitles = async (req, res) => {
  try {
    const titles = await JobTitle.find();
    res.json(titles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ONE
exports.getJobTitleById = async (req, res) => {
  try {
    const title = await JobTitle.findById(req.params.id);
    if (!title) return res.status(404).json({ message: 'Job title not found' });
    res.json(title);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateJobTitle = async (req, res) => {
  try {
    const updated = await JobTitle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Job title not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
exports.deleteJobTitle = async (req, res) => {
  try {
    const deleted = await JobTitle.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Job title not found' });
    res.json({ message: 'Job title deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
