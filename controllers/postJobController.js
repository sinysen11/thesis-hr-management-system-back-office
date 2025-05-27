const PostJob = require('../models/postJob');

// CREATE
exports.createPostJob = async (req, res) => {
  try {
    const newJob = new PostJob(req.body);
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET ALL
exports.getAllPostJobs = async (req, res) => {
  try {
    const jobs = await PostJob.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ONE
exports.getPostJobById = async (req, res) => {
  try {
    const job = await PostJob.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updatePostJob = async (req, res) => {
  try {
    const updatedJob = await PostJob.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedJob) return res.status(404).json({ message: 'Job not found' });
    res.json(updatedJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
exports.deletePostJob = async (req, res) => {
  try {
    const deletedJob = await PostJob.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
