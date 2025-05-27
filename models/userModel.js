const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name_kh: { type: String, required: true },
  name_en: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  phone_number: { type: String, required: true },
  gender: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
