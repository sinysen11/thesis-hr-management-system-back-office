const LeaveType = require('../models/requestLeave');
const User = require('../models/userModel');
// CREATE
exports.createLeaveType = async (req, res) => {
  try {
    const user_id = req?.user?.userId;
    const user = await User.findById(user_id);
    console.log(user)
    const { name } = req.body;
    const existing = await LeaveType.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      return res.status(400).json({ message: 'Leave type already exists' });
    }
    const leaveType = await LeaveType.create(req.body);
    res.status(201).json(leaveType);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ ALL
exports.getLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find();
    res.status(200).json(leaveTypes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
exports.getLeaveTypeById = async (req, res) => {
  try {
    const leaveType = await LeaveType.findById(req.params.id);
    if (!leaveType) return res.status(404).json({ message: 'Leave Type not found' });
    res.status(200).json(leaveType);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!leaveType) return res.status(404).json({ message: 'Leave Type not found' });
    res.status(200).json(leaveType);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
exports.deleteLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findByIdAndDelete(req.params.id);
    if (!leaveType) return res.status(404).json({ message: 'Leave Type not found' });
    res.status(200).json({ message: 'Leave Type deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
