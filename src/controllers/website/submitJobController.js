const LeaveStatus = require('../../enums/leaveStatus');
const SubmitJob = require('../../models/website/job');
const Mail = require('../../controllers/mailController');
const Applicant = require('../../models/website/applicant');
const { logUserAction } = require('../../middlewares/activityLogger');


exports.submit = async (req, res) => {
    try {
        const { 
            applicant, 
            jobId,
            apply_position,
            requested_location,
            education_from_year,
            education_to_year,
            school_name,
            major,
            degree,
            location,
            start_date,
            end_date,
            position,
            company,
            salary_usd,
            expected_salary,
            knows_someone,
            knows_someone_details,
            resume,
            why_apply
        } = req.body;
        if (!applicant) {
            return res.status(400).json({ status: -1, message: "Applicant is required." });
        } else if (!jobId) {
            return res.status(400).json({ status: -1, message: "Job is required." });
        } else if (!resume) {
            return res.status(400).json({ status: -1, message: "Resume file is required." });
        }

        const submission = new SubmitJob({
            applicant,
            jobId,
            apply_position,
            requested_location,
            education_from_year,
            education_to_year,
            school_name,
            major,
            degree,
            location,
            start_date,
            end_date,
            position,
            company,
            salary_usd,
            expected_salary,
            knows_someone,
            knows_someone_details,
            why_apply,
            resume,
            status: LeaveStatus.SUBMITTED
        });

        const data = await Applicant.findById(applicant);
        data.apply_count += 1;
        
        const applicant_mail = data.email;

        await logUserAction({ req, describtion: "From Website", action: "apply_job",});
        await data.save();
        await Mail.sendApplyJobMail(applicant_mail);
        await submission.save();

        res.status(201).json({ status: 1, message: "Job submitted successfully", submission });
    } catch (error) {
        await logUserAction({ req, responseMessage: err.message, describtion: "From Website", action: "apply_job",});
        res.status(500).json({ status: 0, message: error });
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
            .populate('resume')
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