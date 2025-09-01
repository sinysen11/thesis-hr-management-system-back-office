const PostJob = require('../models/postJob');

// CREATE
exports.createPostJob = async (req, res) => {
  try {
    const newJob = new PostJob(req.body);
    const savedJob = await newJob.save();
    res.status(201).json({status: 1, message: "Successfully", savedJob});
  } catch (err) {
    res.status(400).json({status: 0, message: err.message });
  }
};

// GET ALL
exports.getAllPostJobs = async (req, res) => {
  try {
    const jobs = await PostJob.find()
    .populate('title')
    .populate('department')
    res.json({ jobs, status: 1, message: 'get jobs successfully' });
  } catch (err) {
    res.status(500).json({status: 0, message: err.message });
  }
};

// GET ONE
exports.getPostJobById = async (req, res) => {
  try {
    const job = await PostJob.findById(req.params.id);
    if (!job) return res.status(404).json({status: -1, message: 'Job not found' });
    res.json({status: 1, message: "Successfully", job});
  } catch (err) {
    res.status(500).json({message: 0, message: err.message });
  }
};

// UPDATE
exports.updatePostJob = async (req, res) => {
  try {
    const updatedJob = await PostJob.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedJob) return res.status(404).json({status: -1, message: 'Job not found' });
    res.json({status: 1, message: "Successfully", updatedJob});
  } catch (err) {
    res.status(400).json({status: 0, message: err.message });
  }
};

// DELETE
exports.deletePostJob = async (req, res) => {
  try {
    const deletedJob = await PostJob.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({status: -1, message: 'Job not found' });
    res.json({status: 1, message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({status: 0, message: err.message });
  }
};
