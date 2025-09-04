const mongoose = require('mongoose');

const LeaveRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  reason: { type: String, required: true },
  status: { type: String },
  isMorning: { type: Boolean },
  isNoon: { type: Boolean },
  isFull: { type: Boolean }
}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema);