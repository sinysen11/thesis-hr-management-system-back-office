const LeaveRequest = require('../models/leaveRequest');
const LeaveBalance = require('../models/leaveBalance');
const User = require('../models/userModel');
const PublicHoliday = require('../models/publicHoliday');
const STATUS = require('../enums/leaveStatus');
const Mail = require('../controllers/mailController');
const mongoose = require('mongoose');
const { logUserAction } = require('../middlewares/activityLogger'); 

exports.createLeaveRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { user, type, fromDate, toDate, approver, reason, isMorning, isNoon, isFull } = req.body;

    let days = 0;

    if (isMorning || isNoon) {
      const holidaySet = await getHolidayDatesSet();
      if (isWeekendOrHoliday(new Date(fromDate), holidaySet)) {
        throw new Error('Selected date is a weekend or public holiday');
      }
      days = 0.5;
    } else if (isFull) {
      days = await calculateLeaveDays(fromDate, toDate);
    } else {
      throw new Error("Invalid leave type: must specify isMorning, isNoon, or isFull");
    }

    const leaveBalance = await LeaveBalance.find({ userId: user, type: type })
      .populate('type')
      .session(session);

    if (!leaveBalance || leaveBalance.length === 0) {
      throw new Error('Leave balance not found');
    }

    let balance = leaveBalance[0];
    if (balance.total < days) {
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
      status: STATUS.PENDING,
      isMorning,
      isNoon,
      isFull
    });

    const [user_request, user_approver] = await Promise.all([
      User.findById(user),
      User.findById(approver)
    ]);

    let content = {
      staffEmail: user_request.email,
      staffName: user_request.last_name_en + " " + user_request.first_name_en,
      approverEmail: user_approver.email,
      leaveDate: `From ${fromDate} to ${toDate}`,
      reason: reason
    };

    await logUserAction({ req, action: "create_leave_request",});
    await Mail.sendLeaveRequestMail(content);
    await leaveRequest.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ status: 1, message: 'Leave request created', leaveRequest });
  } catch (error) {
    await logUserAction({ req, responseMessage: error.message, action: "create_leave_request",});
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

    const [data] = await Promise.all([
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
        .then(users => users.filter(u => u.role))
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

    const leaveRequest = await LeaveRequest.findById(request_id)
      .populate({ path: 'user', model: 'User' })
      .populate({ path: 'approver', model: 'User' });

    if (!leaveRequest) {
      return res.status(404).json({ status: -1, message: 'Leave request not found' });
    }

    const isPending = leaveRequest.status === STATUS.PENDING;

    let totalDays = 0;
    if (leaveRequest.isMorning || leaveRequest.isNoon) {
      totalDays = 0.5;
    } else if (leaveRequest.isFull) {
      totalDays = await calculateLeaveDays(leaveRequest.fromDate, leaveRequest.toDate); // async
    }

    leaveRequest.status = status;

    if ((status === STATUS.REJECTED || status === STATUS.CANCELLED) && isPending) {
      const leaveBalance = await LeaveBalance.findOne({
        userId: leaveRequest.user._id,
        type: leaveRequest.type,
      }).populate('type');

      if (leaveBalance) {
        leaveBalance.total += totalDays;
        await leaveBalance.save();
      }
    }

    const from_date = formatDate(leaveRequest.fromDate);
    const to_date = formatDate(leaveRequest.toDate);

    let content = {
      staffEmail: leaveRequest.user.email,
      staffName: leaveRequest.user.last_name_en + " " + leaveRequest.user.first_name_en,
      approverName: leaveRequest.approver.last_name_en + " " + leaveRequest.approver.first_name_en,
      leaveDate: `From ${from_date} to ${to_date}`,
      reason: leaveRequest.reason,
      status: status
    };

    await Mail.sendLeaveResponseMail(content);
    await leaveRequest.save();

    res.status(200).json({ status: 1, message: `Leave ${status.toLowerCase()}`, leaveRequest });

  } catch (err) {
    res.status(500).json({ status: 0, message: err.message });
  }
};

async function getHolidayDatesSet() {
  const holidays = await PublicHoliday.find({}, { _id: 0, startDate: 1, endDate: 1 }).lean();
  const holidayDates = new Set();

  holidays.forEach(h => {
    const s = new Date(h.startDate);
    const e = new Date(h.endDate || h.startDate);
    let d = new Date(s);
    while (d <= e) {
      holidayDates.add(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
  });

  return holidayDates;
}

// check if a date is weekend or public holiday
function isWeekendOrHoliday(dateObj, holidaySet) {
  const day = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
  if (day === 0 || day === 6) return true;
  const dateStr = dateObj.toISOString().slice(0, 10);
  if (holidaySet.has(dateStr)) return true;
  return false;
}

async function calculateLeaveDays(from, to) {
  const start = new Date(from);
  const end = new Date(to);

  const holidaySet = await getHolidayDatesSet();

  let days = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (isWeekendOrHoliday(new Date(d), holidaySet)) continue;
    days++;
  }

  return days;
}

function formatDate(date) {
  if (!date) return "N/A";
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
}
