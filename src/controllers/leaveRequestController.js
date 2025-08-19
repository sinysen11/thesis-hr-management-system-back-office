const LeaveRequest = require('../models/leaveRequest');
const LeaveBalance = require('../models/leaveBalance');
const User = require('../models/userModel');
const STATUS = require('../enums/leaveStatus');
const mongoose = require('mongoose');

exports.createLeaveRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { user, type, fromDate, toDate, approver, reason } = req.body;

    const days = calculateLeaveDays(fromDate, toDate);

    const leaveBalance = await LeaveBalance.find({ userId: user, type: type })
      .populate('type')
      .session(session);

    if (!leaveBalance) throw new Error('Leave balance not found');

    let balance = leaveBalance[0];
    if (!balance || balance.total < days) {
      throw new Error('Insufficient leave balance');
    }

    balance.total -= days;

    await balance.save({ session });
    const leaveRequest = new LeaveRequest({
      user,
      type,
      fromDate,
      toDate,
      approver,
      reason,
      status: STATUS.PENDING
    });

    await leaveRequest.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ status: 1, message: 'Leave request created', leaveRequest });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

exports.getLeaveRequests = async (req, res) => {
  try {
    const { user_id } = req.params;
    const filter = {};

    if (user_id) {
      filter.user = user_id;
    }

    if (!user_id) {
      return res.status(404).json({ status: -1, message: 'User not found' });
    }

    const data = await LeaveRequest.find(filter)
      .populate('user')
      .populate({
        path: 'user',
        populate: {
          path: 'department',
          model: 'Department'
        }
      })
      .populate('type')
      .populate('approver')
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 1, message: 'Successfully', data });
  } catch (err) {
    res.status(500).json({ status: 0, message: err.message });
  }
};

exports.getAllApprover = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
    const q = (req.query.q || '').trim();

    const filter = q
      ? {
        $or: [
          { first_name_en: new RegExp(q, 'i') },
          { last_name_en: new RegExp(q, 'i') },
          { email: new RegExp(q, 'i') },
          { username: new RegExp(q, 'i') },
        ],
      }
      : {};

    const [data, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .populate({
          path: 'role',
          match: { name: { $ne: 'Staff' } }
        })
        .populate('department')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .then(users => users.filter(u => u.role)),
      User.countDocuments(filter)
    ]);

    res.json({
      page,
      limit,
      total: data.length,
      data,
      status: 1,
      message: 'Successfully'
    });
  } catch (err) {
    res.status(500).json({ status: 0, message: err.message });
  }
};


exports.getLeaveRequestsForApprover = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { status, type, name, page = 1, limit = 10 } = req.query;

    if (!user_id) {
      return res.status(404).json({ status: -1, message: 'User not found' });
    }

    const user = await User.findById(user_id).populate('role');
    if (!user) {
      return res.status(404).json({ status: -1, message: 'User not found' });
    }

    const query = { status: { $ne: STATUS.CANCELLED } };
    if (user?.role?.name !== 'Super Admin') {
      query.approver = user_id;
    }
    
    if (status) query.status = status;
    if (type) query['type.code'] = type;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    let data = await LeaveRequest.find(query)
      .populate({ path: 'user', populate: { path: 'department', model: 'Department' } })
      .populate('type')
      .populate('approver')
      .sort({ createdAt: -1 });

    if (name) {
      const userName = name.toLowerCase();
      data = data.filter(item =>
        item.user &&
        (
          (item.user.first_name_en && item.user.first_name_en.toLowerCase().includes(userName)) ||
          (item.user.last_name_en && item.user.last_name_en.toLowerCase().includes(userName))
        )
      );
    }

    const total = data.length;
    const paginatedData = data.slice(skipNum, skipNum + limitNum);

    res.status(200).json({
      status: 1,
      message: 'Successfully',
      data: paginatedData,
      pagination: { total, page: pageNum, limit: limitNum }
    });

  } catch (err) {
    res.status(500).json({ status: 0, message: err.message });
  }
};


exports.updateLeaveStatus = async (req, res) => {
  try {
    const { request_id } = req.params;
    const { status } = req.body;

    const leaveRequest = await LeaveRequest.findById(request_id);
    if (!leaveRequest) {
      return res.status(404).json({ status: -1, message: 'Leave request not found' });
    }

    const isPending = leaveRequest.status === STATUS.PENDING;
    const totalDays = calculateLeaveDays(leaveRequest.fromDate, leaveRequest.toDate);

    leaveRequest.status = status;

    if ((status === STATUS.REJECTED || status === STATUS.CANCELLED) && isPending) {
      const leaveBalance = await LeaveBalance.findOne({
        userId: leaveRequest.user,
        type: leaveRequest.type,
      }).populate('type');
      if (leaveBalance) {
        const total_update = leaveBalance.total + totalDays;
        leaveBalance.total = total_update;
        await leaveBalance.save();
      }
    }
    await leaveRequest.save();
    res.status(200).json({ status: 1, message: `Leave ${status.toLowerCase()}`, leaveRequest });

  } catch (err) {
    res.status(500).json({ status: 0, message: err.message });
  }
};

function calculateLeaveDays(from, to) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(to) - new Date(from)) / oneDay) + 1;
}
