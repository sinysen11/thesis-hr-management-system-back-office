const LeaveStatus = require('../../enums/leaveStatus');
const SubmitJob = require('../../models/website/job');

exports.submit = async (req, res) => {
    try {
        const { applicant, job } = req.body;
        const file = req.file;
        if (!applicant) {
            return res.status(400).json({ status: -1, message: "Applicant is required." });
        } else if (!job) {
            return res.status(400).json({ status: -1, message: "Job is required." });
        } else if (!file) {
            return res.status(400).json({ status: -1, message: "Resume file is required." });
        }

        const submission = new SubmitJob({
            applicant,
            job,
            resume: {
                fileName: file.originalname,
                fileType: file.mimetype,
                fileSize: file.size,
                url: file.path
            },
            status: LeaveStatus.SUBMITTED
        });

        await submission.save();

        res.status(201).json({ status: 1, message: "Job submitted successfully", submission });
    } catch (error) {
        res.status(500).json({ status: 0, message: "Server error while submitting job" });
    }
};

exports.getApplyJobs = async (req, res) => {
    try {
        const { applicant_id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await SubmitJob.countDocuments({ applicant: applicant_id });
        const data = await SubmitJob.find({ applicant: applicant_id })
            .populate('applicant')
            .populate('job')
            .skip(skip)
            .limit(limit);
        if (!data) {
            return res.status(404).json({status: -1, message: 'Applicant is not found' })
        }
        
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