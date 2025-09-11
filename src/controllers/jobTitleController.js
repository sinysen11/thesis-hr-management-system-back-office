const JobTitle = require('../models/jobTitle');
const { logUserAction } = require('../middlewares/activityLogger');

// CREATE
exports.createJobTitle = async (req, res) => {
  try {
    const title = new JobTitle(req.body);
    const data = await title.save();
    await logUserAction({ req, action: "create_job" });
    res.status(201).json({status: 1, message: "Create department successfully", data});
  } catch (err) {
    await logUserAction({ req, responseMessage: err.message, action: "create_job",});
    res.status(400).json({ message: err.message });
  }
};

// GET ALL
exports.getAllJobTitles = async (req, res) => {
  try {
    const jobs = await JobTitle.find();
    res.json({ jobs, status: 1, message: 'get jobs title successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ONE
exports.getJobTitleById = async (req, res) => {
  try {
    const data = await JobTitle.findById(req.params.id);
    if (!data) return res.status(404).json({status: -1, message: 'Job data not found' });
    await logUserAction({ req, action: "update_job" });
    res.json({status: 1, message: "Successfully", data});
  } catch (err) {
    await logUserAction({ req, responseMessage: err.message, action: "update_job" });
    res.status(500).json({status: 0, message: err.message });
  }
};

// UPDATE
exports.updateJobTitle = async (req, res) => {
  try {
    const data = await JobTitle.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!data)
    return res.status(404).json({status: -1, message: 'Job title not found' });
  
    res.json({status: 1, message: "Successfully", data});
  } catch (err) {
    res.status(400).json({status: 0,  message: err.message });
  }
};

// DELETE
exports.deleteJobTitle = async (req, res) => {
  try {
    const deleted = await JobTitle.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ status: -1, message: 'Job title not found' });
    res.json({status: 1, message: 'Job title deleted' });
  } catch (err) {
    res.status(500).json({status: 0, message: err.message });
  }
};
