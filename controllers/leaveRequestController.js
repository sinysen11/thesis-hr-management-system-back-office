const LeaveRequest = require('../models/LeaveRequest');
const { subtractLeaveBalance, addLeaveBalance } = require('../utils/leaveBalanceUtils');
const dayjs = require('dayjs');

exports.createLeaveRequest = async (req, res) => {
  try {
    const { user, type, fromDate, toDate } = req.body;
    const start = dayjs(fromDate);
    const end = dayjs(toDate);
    const totalDays = end.diff(start, 'day') + 1;

    if (totalDays <= 0) {
      return res.status(400).json({ message: 'Invalid date range' });
    }
    const leaveRequest = await LeaveRequest.create({
      user,
      type,
      fromDate,
      toDate,
      totalDays,
      status: 'PENDING'
    });

    await subtractLeaveBalance(user, type, totalDays);

    res.status(201).json({ message: 'Leave request submitted', leaveRequest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { request_id } = req.params;
    const { status } = req.body;

    const leaveRequest = await LeaveRequest.findById(request_id);
    if (!leaveRequest) return res.status(404).json({ message: 'Leave request not found' });

    const prevStatus = leaveRequest.status;
    leaveRequest.status = status;
    await leaveRequest.save();

    if ((status === 'REJECTED' || status === 'CANCELLED') && prevStatus === 'PENDING') {
      await addLeaveBalance(leaveRequest.user, leaveRequest.type, leaveRequest.totalDays);
    }

    res.status(200).json({ message: `Leave ${status.toLowerCase()}`, leaveRequest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
