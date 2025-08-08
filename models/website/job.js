const mongoose = require('mongoose');

const SubmitJobSchema = new mongoose.Schema({
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant' },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'PostJob'},
    resume: {
        fileName: { type: String, required: true },
        fileType: { type: String, default: 'application/pdf' },
        fileSize: Number,
        url: { type: String, required: true }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SubmitJob', SubmitJobSchema);