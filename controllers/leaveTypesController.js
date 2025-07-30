const LeaveType = require('../models/leaveTypes');

exports.createLeaveType = async (req, res) => {
  try {
    const existing = await LeaveType.findOne({ name: req.body.name });
    if (existing) {
      return res.status(400).json({ status: -1, message: `Leave type "${req.body.name}" already exists.` });
    }

    const leaveType = new LeaveType(req.body);
    await leaveType.save();
    res.status(201).json(leaveType);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find();
    res.json(leaveTypes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLeaveTypeById = async (req, res) => {
  try {
    const leaveType = await LeaveType.findById(req.params.id);
    if (!leaveType) return res.status(404).json({ message: 'Leave Type not found' });
    res.json(leaveType);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!leaveType) return res.status(404).json({ message: 'Leave Type not found' });
    res.json(leaveType);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findByIdAndDelete(req.params.id);
    if (!leaveType) return res.status(404).json({ message: 'Leave Type not found' });
    res.json({ message: 'Leave Type deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
