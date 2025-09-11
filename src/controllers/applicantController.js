const SubmitJob = require('../models/website/job');
const { logUserAction } = require('../middlewares/activityLogger');

exports.getAllApplyJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await SubmitJob.countDocuments();

        const data = await SubmitJob.find()
            .populate('applicant')
            .populate('resume')
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

        await logUserAction({
            req,
            action: "get_allapplyjobs",
        });

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