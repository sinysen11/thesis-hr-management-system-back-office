
const PostJob = require('../../models/postJob');

exports.getAllJobForWebsite = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const totalJobs = await PostJob.countDocuments();

    const data = await PostJob.find()
      .populate('title')
      .populate('department')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      status: 1,
      message: "Successfully",
      data,
      pagination: {
        total: totalJobs,
        page,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ status: 0, message: error.message });
  }
};

exports.getJobForWebsiteById = async (req, res) => {
  try {
    const { job_id } = req.params;

    const data = await PostJob.findById(job_id)
      .populate('title')
      .populate('department')
      .sort({ createdAt: -1 });

    res.json({
      status: 1,
      message: "Successfully",
      data
    });
  } catch (error) {
    res.status(500).json({ status: 0, message: error.message });
  }
}