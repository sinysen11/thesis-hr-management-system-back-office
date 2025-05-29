const mongoose = require('mongoose');


const LeaveTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String },
  maxDaysPerYear: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, {
    timestamps: true
});

LeaveTypeSchema.pre('save', async function (next) {
  if (!this.code && this.name) {
    let baseCode = this.name.match(/\b\w/g)?.join('').toUpperCase() || 'N/A';
    let code = baseCode;

    while (await mongoose.models.LeaveType.findOne({ code })) {
      code += baseCode.slice(-1);
    }
    this.code = code;
  }

  next();
});


const LeaveRequestSchema = new mongoose.Schema({
    manager: { type: String, required: true},
    start_date: { type: Date, required: true },
    until_date: { type: Date, required: true },
    return_date: { type: Date, required: true},
    reason: { type: String, required: true }
}, {
    timestamps: true
})

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema);
module.exports = mongoose.model('LeaveType', LeaveTypeSchema);