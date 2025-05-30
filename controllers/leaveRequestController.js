const LeaveRequest = require('../models/requestLeave');
const LeaveBalance = require('../models/LeaveBalance');
const LeaveType = require('../models/requestTypes');
const User = require('../models/userModel');
const mongoose = require('mongoose');

exports.getLeaveOwnerByUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        const currentYear = new Date().getFullYear();

        const leaveBalance = await LeaveBalance.findOne({ user: userId, year: currentYear })
            .populate('leaveTypes.leaveType', 'name maxDaysPerYear code');

        if (!leaveBalance) {
            return res.status(404).json({ message: 'Leave balance not found' });
        }

        res.json({ status: 1, data: leaveBalance });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createLeaveRequest = async (req, res) => {
    try {
        const { leaveType, start_date, until_date, return_date, reason, status } = req.body;
        const userId = req.user.userId;

        const currentYear = new Date().getFullYear();

        const type_of_request = await LeaveType.findById(leaveType);
        const leave_max_data = await LeaveBalance.find(type_of_request.leaveType)
        const start_dates = new Date(start_date);
        const until_dates = new Date(until_date);

        // Calculate difference in days
        const diffInMs = until_dates.getTime() - start_dates.getTime();
        const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

        console.log("leaveTypes", req.body, "\n", leave_max_data)

        // await leaveBalance.save();

        // const newRequest = new LeaveRequest({
        //   user: userId,
        //   leaveType,
        //   start_date,
        //   until_date,
        //   return_date,
        //   reason,
        //   totalDays,
        //   status
        // });

        // await newRequest.save();

        res.status(201).json({ status: 1, message: 'Leave request created successfully', data: newRequest });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
