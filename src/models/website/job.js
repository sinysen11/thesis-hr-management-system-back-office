const mongoose = require('mongoose');

const SubmitJobSchema = new mongoose.Schema({
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant' },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'PostJob'},
    apply_position: { type: String },
    requested_location: { type: String },
    education_from_year: { type: String },
    education_to_year: { type: String },
    school_name: { type: String },
    major: { type: String },
    degree: { type: String },
    location: { type: String },
    start_date: { type: Date },
    end_date: { type: Date },
    position: { type: String },
    company: { type: String },
    salary_usd: { type: String },
    expected_salary: { type: String },
    knows_someone: { type: Boolean },
    knows_someone_details: { type: String },
    why_apply: { type: String },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Document'},
}, {
    timestamps: true
});

module.exports = mongoose.model('SubmitJob', SubmitJobSchema);