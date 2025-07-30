const mongoose = require('mongoose');

const LeaveBalanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  year: { type: Number, required: true },
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
}, {timestamps: true});
module.exports =  mongoose.model('LeaveBalance', LeaveBalanceSchema);