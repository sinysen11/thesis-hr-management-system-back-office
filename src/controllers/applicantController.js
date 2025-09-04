const SubmitJob = require('../models/website/job');
const path = require('path');
const fs = require('fs');

exports.getAllApplyJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await SubmitJob.countDocuments();

        const data = await SubmitJob.find()
            .populate('applicant')
            .populate({
                path: "jobId",
                populate: [
                    {
                        path: "title",
                        model: "JobTitle",
                    },
                    {
                        path: "department",
                        model: "Department",
                    },
                ],
            })

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

    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};


exports.getResume = async (req, res) => {
  try {
    const { submit_id } = req.params;
    const jobApplication = await SubmitJob.findById(submit_id);

    if (!jobApplication) {
      return res.status(404).json({ status: 0, message: 'Resume not found' });
    }

    let resumeUrl = jobApplication.resume.url
      .replace(/^\/+/, '')
      .replace(/\\/g, '/');

    const resumePath = path.join(__dirname, '..', '..', resumeUrl);

    if (!fs.existsSync(resumePath)) {
      return res.status(404).json({ status: 0, message: 'File not found' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(resumePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: error.message });
  }
};


