const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  sex: { type: String, required: true },
  dob: { type: Date, required: true },
  current_address: { type: String, required: true },
  telegram: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  confirm_password: { type: String },
  phone: { type: String, required: true },
  apply_count: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Applicant', applicantSchema);
