const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  isPaid: { type: Boolean, default: true },
  total: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('LeaveType', leaveTypeSchema);
