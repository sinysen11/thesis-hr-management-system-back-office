const mongoose = require('mongoose');

const LeaveTypeBalanceSchema = new mongoose.Schema({
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
  balance: { type: Number, required: true, default: 0 },
  code: { type: String, required: true }
});

const LeaveBalanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  year: { type: Number, required: true },
  type: [LeaveTypeBalanceSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('LeaveBalance', LeaveBalanceSchema);
