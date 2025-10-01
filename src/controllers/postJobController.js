const PostJob = require('../models/postJob');
const { logUserAction } = require('../middlewares/activityLogger');

// CREATE
exports.createPostJob = async (req, res) => {
  try {
    const newJob = new PostJob(req.body);
    const savedJob = await newJob.save();
    await logUserAction({ req, action: "post_job",});
    res.status(201).json({status: 1, message: "Successfully", savedJob});
  } catch (err) {
    await logUserAction({ req, responseMessage: err.message, action: "post_job",});
    res.status(400).json({status: 0, message: err.message });
  }
};

// GET ALL
exports.getAllPostJobs = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const total = await PostJob.countDocuments();

    const data = await PostJob.find()
      .populate('title')
      .populate('department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 1,
      message: "Successfully",
      data,
      pagination: {
        total,
        page,
        limit,
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 0,
      message: err.message,
    });
  }
};


// GET ONE
exports.getPostJobById = async (req, res) => {
  try {
    const job = await PostJob.findById(req.params.id)
    .populate('title')
    .populate('department')
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
    await logUserAction({ req, action: "update_job"});
    res.json({status: 1, message: "Successfully", updatedJob});
  } catch (err) {
    await logUserAction({ req, responseMessage: err.message, action: "update_job"});
    res.status(400).json({status: 0, message: err.message });
  }
};

// DELETE
exports.deletePostJob = async (req, res) => {
  try {
    const deletedJob = await PostJob.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({status: -1, message: 'Job not found' });
    await logUserAction({ req, action: "delete_job"});
    res.json({status: 1, message: 'Job deleted' });
  } catch (err) {
    await logUserAction({ req, action: "delete_job"});
    res.status(500).json({status: 0, message: err.message });
  }
};
