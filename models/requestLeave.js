const mongoose = require('mongoose');

const LeaveRequestSchema = new mongoose.Schema({
    manager: { type: String, required: true},
    start_date: { type: Date, required: true },
    until_date: { type: Date, required: true },
    return_date: { type: Date, required: true},
    reason: { type: String, required: true },
    status: { type: String, required: true },
    leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true }
}, {
    timestamps: true
})

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema);
