
const PostJob = require('../../models/postJob');

exports.getAllJobForWebsite = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const totalJobs = await PostJob.countDocuments();

    const data = await PostJob.find()
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
    let { page = 1, limit = 10 } = req.query;
    const { job_id } = req.params;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const totalJobs = await PostJob.countDocuments({ job_id });

    const data = await PostJob.findById(job_id)
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
