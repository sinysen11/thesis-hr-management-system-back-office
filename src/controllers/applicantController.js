const SubmitJob = require('../models/website/job');
const { logUserAction } = require('../middlewares/activityLogger');
const Mail = require('../controllers/mailController');

exports.getAllApplyJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { from, to, position, status } = req.query;
        let filter = {};

        if (status) {
            filter.status = status;
        }

        if (from || to) {
            filter.createdAt = {};
            if (from) {
                filter.createdAt.$gte = new Date(from);
            }
            if (to) {
                const nextDay = new Date(to);
                nextDay.setDate(nextDay.getDate() + 1);
                filter.createdAt.$lt = nextDay;
            }
        }

        if (position) {
            filter.jobId = position;
        }

        const total = await SubmitJob.countDocuments(filter);

        const data = await SubmitJob.find(filter)
            .populate('applicant')
            .populate('resume')
            .populate({
                path: "jobId",
                populate: [
                    { path: "title", model: "JobTitle" },
                    { path: "department", model: "Department" },
                ],
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);


        await logUserAction({
            req,
            action: "get_allapplyjobs",
            details: filter,
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
exports.getApplyJobById = async (req, res) => {
    try {
        const { id } = req.params;

        const applyJob = await SubmitJob.findById(id)
            .populate('applicant')
            .populate('resume')
            .populate({
                path: "jobId",
                populate: [
                    { path: "title", model: "JobTitle" },
                    { path: "department", model: "Department" }
                ]
            });

        if (!applyJob) {
            return res.status(404).json({
                status: 0,
                message: "Job application not found",
            });
        }

        await logUserAction({
            req,
            action: "get_applyjob_by_id",
            targetId: id
        });

        res.status(200).json({
            status: 1,
            message: "Successfully retrieved",
            data: applyJob
        });

    } catch (error) {
        res.status(500).json({
            status: 0,
            message: error.message
        });
    }
};

exports.updateApplyJobStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, interview } = req.body;

        if (!status) {
            return res.status(400).json({ status: 0, message: "Status is required" });
        }

        const allowedStatuses = [
            "SUBMITTED", "SHORTLISTED",
            "INTERVIEWING", "HIRED", "REJECTED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                status: 0,
                message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`
            });
        }

        const updateData = { status };

        if (status === "INTERVIEWING") {
            if (!interview?.date || !interview?.time || !interview?.location || !interview?.mode) {
                return res.status(400).json({
                    status: 0,
                    message: "Interview date, time, mode, and location/link are required to schedule an interview.",
                });
            }

            updateData.interview = {
                date: interview.date,
                time: interview.time,
                location: interview.location,
                mode: interview.mode,
                notes: interview.notes || ""
            };
        }

        const applyJob = await SubmitJob.findByIdAndUpdate(id, updateData, { new: true })
            .populate('applicant')
            .populate('resume')
            .populate({
                path: "jobId",
                populate: [
                    { path: "title", model: "JobTitle" },
                    { path: "department", model: "Department" }
                ]
            });

        if (!applyJob) {
            return res.status(404).json({ status: 0, message: "Job application not found" });
        }

        const applicantEmail = applyJob.applicant?.email;
        const positionTitle = applyJob.jobId?.title?.des_en || 'N/A Position';

        if (applicantEmail) {
            if (status === "INTERVIEWING") {
                const interviewDetails = {
                    date: applyJob.interview.date,
                    time: applyJob.interview.time,
                    location: applyJob.interview.location,
                    mode: interview.mode,
                };
                
                await Mail.sendCallForInterviewMail(applicantEmail, positionTitle, interviewDetails)
                    .then(() => console.log(`Interview mail sent to ${applicantEmail}`))
                    .catch(error => console.error(`Failed to send interview mail to ${applicantEmail}:`, error));
            } else if (status === "HIRED") {
                await Mail.sendHiredMail(applicantEmail, positionTitle)
                    .then(() => console.log(`Hired mail sent to ${applicantEmail}`))
                    .catch(error => console.error(`Failed to send hired mail to ${applicantEmail}:`, error));
            }
        }

        await logUserAction({
            req,
            action: "update_applyjob_status",
            targetId: id,
            details: updateData
        });

        res.status(200).json({
            status: 1,
            message: "Status updated successfully",
            data: applyJob,
        });

    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};