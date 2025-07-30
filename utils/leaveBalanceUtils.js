const LeaveBalance = require('../models/leaveBalance');

async function subtractLeaveBalance(user, type, days) {
  const leaveBalance = await LeaveBalance.findOne({ userId: user });
    console.log(leaveBalance)

  const leaveType = await leaveBalance.find(types => types.code === type);
  if (!leaveType || leaveType.balance < days) throw new Error('Insufficient balance');

  leaveType.balance -= days;
  await leaveBalance.save();
}

async function addLeaveBalance(user, type, days) {
  const leaveBalance = await LeaveBalance.findOne({ userId: user });
  const leaveType = leaveBalance.type.find(types => types.code === type);
  if (!leaveType) throw new Error('Leave type not found');

  leaveType.balance += days;
  await leaveBalance.save();
}

module.exports = { subtractLeaveBalance, addLeaveBalance };
