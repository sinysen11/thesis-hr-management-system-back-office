const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name_kh: { type: String, required: true },
  last_name_kh: { type: String, required: true },
  first_name_en: { type: String, required: true },
  last_name_en: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  position: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true },
  phone_number: { type: String, required: true },
  gender: { type: String, required: true },
  dob: { type: Date, required: true}
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
