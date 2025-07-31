const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/leaveBalance');
const mongoose = require('mongoose');

exports.createLeaveRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { user, type, fromDate, toDate, approver } = req.body;

    const days = calculateLeaveDays(fromDate, toDate);

    const leaveBalance = await LeaveBalance.find({ userId: user, type: type })
      .populate('type')
      .session(session);

    if (!leaveBalance) throw new Error('Leave balance not found');

    let balance = leaveBalance[0].type;
    if (!balance || balance.totalDaysPerYear < days) {
      throw new Error('Insufficient leave balance');
    }

    balance.totalDaysPerYear -= days;

    await balance.save({ session });
    const leaveRequest = new LeaveRequest({
      user,
      type,
      fromDate,
      toDate,
      approver,
      status: 'PENDING'
    });

    await leaveRequest.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'Leave request created', leaveRequest });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

function calculateLeaveDays(from, to) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(to) - new Date(from)) / oneDay) + 1;
}

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { request_id } = req.params;
    const { status } = req.body;

    const leaveRequest = await LeaveRequest.findById(request_id).populate('type');
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    const status_pending = leaveRequest.status;
    const totalDays = calculateLeaveDays(leaveRequest.fromDate, leaveRequest.toDate);

    leaveRequest.status = status;

    if ((status === 'REJECTED' || status === 'CANCELLED') && status_pending === 'PENDING') {
      const leaveBalance = await LeaveBalance.findOne({
        userId: leaveRequest.user,
        type: leaveRequest.type,
      }).populate('type');

      if (leaveBalance) {
        leaveBalance.type.totalDaysPerYear += totalDays;
        console.log("leaveBalance.type.totalDaysPerYear += totalDays;", leaveBalance.type.totalDaysPerYear);
        await leaveBalance.save();
      }
    }
    await leaveRequest.save();
    res.status(200).json({ message: `Leave ${status.toLowerCase()}`, leaveRequest });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};