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

module.exports = mongoose.model('LeaveType', LeaveTypeSchema);