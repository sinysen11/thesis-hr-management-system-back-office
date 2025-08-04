const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Applicant', applicantSchema);
