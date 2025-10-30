const LeaveRequest = require('../models/leaveRequest');
const User = require('../models/userModel');
const LeaveBalance = require('../models/leaveBalance');
const STATUS = require('../enums/leaveStatus');
const moment = require('moment');
const mongoose = require('mongoose');
const { logUserAction } = require('../middlewares/activityLogger');


const getCalculatedLeaveBalance = async (userId) => {

    const today = moment().startOf('day').toDate();
    const currentYearStart = moment().startOf('year').toDate();

    const [balanceData, pastApprovedLeave] = await Promise.all([
        LeaveBalance.find({ userId: userId }) 
            .populate('type')
            .lean()
            .exec(),

        LeaveRequest.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    status: STATUS.APPROVED,
                    fromDate: { $gte: currentYearStart, $lt: today }
                }
            },
            {
                $group: {
                    _id: '$type',
                    usedHoursYTD: { $sum: '$durationInHours' }
                }
            }
        ])
    ]);
    if (!balanceData || balanceData.length === 0) {
        return {}; 
    }
    const futureLeaveRequests = await LeaveRequest.find({
        user: userId,
        status: STATUS.APPROVED,
        fromDate: { $gt: today }
    }).select('type durationInHours');

    const futureLeaveMap = futureLeaveRequests.reduce((acc, req) => {
        const key = req.type.toString(); 
        acc[key] = (acc[key] || 0) + req.durationInHours;
        return acc;
    }, {});

    const pastUsedMap = pastApprovedLeave.reduce((acc, item) => {
        acc[item._id.toString()] = item.usedHoursYTD;
        return acc;
    }, {});


   const finalReport = [];

    balanceData.forEach(balance => {
        const leaveTypeId = balance.type._id.toString();
        const leaveTypeName = balance.type.name;
        
        const totalEntitled = balance.total || 0; 
        const hoursUsedYTD = pastUsedMap[leaveTypeId] || 0;
        
        const currentBalance = totalEntitled - hoursUsedYTD;
        const bookedFutureHours = futureLeaveMap[leaveTypeId] || 0;

        const projectedBalance = currentBalance - bookedFutureHours;
        
        finalReport.push({
            name: leaveTypeName,
            totalLeftDays: projectedBalance,
            isOverdrawn: projectedBalance < 0
        });
    });
    console.log("Final Calculated Balance Data for User:", userId, finalReport);
    return finalReport;
};


exports.getLeaveRequestsReportForApprover = async (req, res) => {
    try {
        const { user_id } = req.params;
        const filter = {};

        if (!user_id) {
            return res.status(400).json({ status: -1, message: 'Approver User ID is required' });
        }

        filter.approver = user_id;
        filter.status = { $ne: STATUS.CANCELLED };

        const data = await LeaveRequest.find(filter)
            .populate({
                path: 'user',
                select: 'first_name_en last_name_en department',
                populate: {
                    path: 'department',
                    model: 'Department',
                    select: 'name'
                }
            })
            .populate('type', 'name code')
            .populate('approver', 'first_name_en last_name_en')
            .sort({ createdAt: -1 });

        await logUserAction({ req, action: "get_approver_leave_report", });
        res.status(200).json({ status: 1, message: 'Successfully retrieved requests for approver', data });
    } catch (err) {
        await logUserAction({ req, responseMessage: err.message, action: "get_approver_leave_report_error", });
        res.status(500).json({ status: 0, message: err.message });
    }
};

exports.getLeaveRequestsReport = async (req, res) => {
    try {
        const { status, type, page = 1, limit = 10 } = req.query;

        let data = await LeaveRequest.find()
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

        data = data.filter(item => item.status !== STATUS.CANCELLED);
        if (status) { data = data.filter(item => item.status === status); }
        if (type) { data = data.filter(item => item.type && item.type.code === type); }

        // --- Filtering by name/date logic removed for brevity, assuming you handle it ---
        // You had logic here for filtering by name/date

        const total = data.length;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const startIndex = (pageNum - 1) * limitNum;

        const report = data.slice(startIndex, startIndex + limitNum);

        const report_date = new Date();
        await logUserAction({ req, action: "get_leave_report", });
        res.status(200).json({
            status: 1,
            message: 'Successfully',
            date: report_date,
            pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
            data: report
        });
    } catch (err) {
        await logUserAction({ req, responseMessage: err.message, action: "get_leave_report", });
        res.status(500).json({ status: 0, message: err.message });
    }
};


exports.getLeaveSummaryAndAuditReport = async (req, res) => {
    try {
        const { status, name, type, departmentId, approverId, fromDate, toDate, upcoming, pendingOverdue, page = 1, limit = 10 } = req.query;
        let { employeeId } = req.params;
        const filter = {};
        const queryTime = moment();
        filter.status = { $ne: STATUS.CANCELLED };
        if (status) { filter.status = status; } else if (pendingOverdue) { filter.status = STATUS.PENDING; }

        if (fromDate || toDate) {
            const dateFilter = {};
            if (fromDate) dateFilter.$gte = moment(fromDate).startOf('day').toDate();
            if (toDate) dateFilter.$lte = moment(toDate).endOf('day').toDate();
            filter.fromDate = dateFilter;
        } else if (upcoming) {
            filter.fromDate = { $gt: queryTime.endOf('day').toDate() };
            filter.status = STATUS.APPROVED;
        }

        if (type) filter.type = type;
        if (approverId) filter.approver = approverId;
        if (employeeId) filter.user = employeeId;

        const employeeFilter = {};
        if (departmentId) employeeFilter.department = departmentId;

        let dataQuery = LeaveRequest.find(filter)
            .populate({
                path: 'user',
                match: employeeFilter,
                select: 'first_name_en last_name_en department',
                populate: [
                    { path: 'department', model: 'Department', select: 'name' }
                ]
            })
            .populate('type', 'name code')
            .populate('approver', 'first_name_en last_name_en')
            .sort({ createdAt: -1 })
            .lean();

        let data = await dataQuery.exec();
        data = data.filter(item => item.user !== null);

        if (name) {
            const searchName = name.toLowerCase().trim();
            data = data.filter(item => {
                const checkMatch = (user) => {
                    if (!user) return false;
                    const fullName = `${user.first_name_en || ''} ${user.last_name_en || ''}`.trim().toLowerCase();
                    return fullName.includes(searchName);
                };
                return checkMatch(item.user) || checkMatch(item.approver);
            });
        }
        const uniqueUserIds = [...new Set(data.map(item => item.user?._id))];

        const balancePromises = uniqueUserIds.map(userId =>
            getCalculatedLeaveBalance(userId)
        );

        const balances = await Promise.all(balancePromises);
        console.log(balances)
        const balanceMap = uniqueUserIds.reduce((map, userId, index) => {
            map[userId] = balances[index];
            return map;
        }, {});
        data = data.map(item => {
            let daysPending = null;
            if (item.status === STATUS.PENDING) {
                const requestedDate = moment(item.createdAt);
                daysPending = queryTime.diff(requestedDate, 'days');
            }

            const userIdString = item.user._id.toString();
            const userBalancesByType = balanceMap[userIdString] || {};

            const annualBalance = userBalancesByType['Annual Leave'] || {};

            return {
                ...item,
                employeeName: `${item.user.first_name_en} ${item.user.last_name_en}`,
                departmentName: item.user.department ? item.user.department.name : 'N/A',
                approverName: item.approver ? `${item.approver.first_name_en} ${item.approver.last_name_en}` : 'N/A',
                leaveTypeName: item.type ? item.type.name : 'N/A',
                daysPending: daysPending,
                totalDaysRequested: moment(item.toDate).diff(moment(item.fromDate), 'days') + 1,

                balance_currentHours: annualBalance.currentBalanceHours || 0,
                balance_projectedHours: annualBalance.projectedBalanceHours || 0,
                balance_fullData: userBalancesByType 
            };
        });

        const total = data.length;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const report = data.slice(startIndex, startIndex + limitNum);

        await logUserAction({ req, action: "get_leave_summary_report", });
        res.status(200).json({
            status: 1,
            message: 'Successfully retrieved leave summary and audit report with balances',
            pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
            data: report,
            balances: balances
        });
    } catch (err) {
        await logUserAction({ req, responseMessage: err.message, action: "get_leave_summary_report_error", });
        res.status(500).json({ status: 0, message: err.message });
    }
};

exports.getEmployeeLeaveHistory = (req, res) => {
    req.query.employeeId = req.params.employeeId;

    if (!req.query.limit) req.query.limit = 1000;

    return exports.getLeaveSummaryAndAuditReport(req, res);
};

exports.getLeaveBalanceByUserId = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({
            status: 0,
            message: 'User ID is required in the request path.'
        });
    }

    try {
        const balanceData = await getCalculatedLeaveBalance(userId);

        if (!balanceData || Object.keys(balanceData).length === 0) {
            return res.status(404).json({
                status: 0,
                message: `No active leave balance entitlements found for user ID: ${userId}`
            });
        }

        await logUserAction({
            req,
            action: "get_user_leave_balance",
            targetId: userId
        });

        res.status(200).json({
            status: 1,
            message: 'Successfully retrieved user leave balance.',
            data: balanceData
        });

    } catch (err) {
        console.error('Error fetching user leave balance:', err);
        await logUserAction({
            req,
            responseMessage: err.message,
            action: "get_user_leave_balance_error"
        });

        res.status(500).json({
            status: 0,
            message: 'An error occurred while calculating the leave balance.',
            error: err.message
        });
    }
};

exports.getLeaveBalanceAndLiabilityReport = async (req, res) => {
    try {
        const { departmentId, type, page = 1, limit = 10 } = req.query;

        const userFilter = {};
        if (departmentId) userFilter.department = departmentId;
        const users = await User.find(userFilter).select('_id');
        const userIds = users.map(u => u._id);

        const balanceFilter = { user: { $in: userIds } }; // FIX: Changed userId to user
        if (type) balanceFilter.type = type;

        let balanceData = await LeaveBalance.find(balanceFilter)
            .populate('user', 'first_name_en last_name_en department')
            .populate('type', 'name code')
            .lean()
            .exec();

        const futureLeaveRequests = await LeaveRequest.find({
            user: { $in: userIds },
            status: STATUS.APPROVED,
            fromDate: { $gt: moment().endOf('day').toDate() }
        }).select('user type durationInHours');

        const futureLeaveMap = futureLeaveRequests.reduce((acc, req) => {
            const key = `${req.user}_${req.type}`;
            acc[key] = (acc[key] || 0) + req.durationInHours;
            return acc;
        }, {});
        console.log(balanceData)

        const finalReport = balanceData.map(balance => {
            const futureHoursKey = `${balance.user._id}_${balance.type._id}`;
            const bookedFutureHours = futureLeaveMap[futureHoursKey] || 0;
            const currentBalance = balance.currentBalanceHours || 0;

            return {
                employeeId: balance.user._id,
                employeeName: `${balance.user.first_name_en} ${balance.user.last_name_en}`,
                type: balance.type.name,

                totalEntitledHours: balance.totalEntitlementHours || 0,
                carryForwardHours: balance.carryForwardHours || 0,
                hoursUsedYTD: balance.hoursUsedYTD || 0,
                leaveRemainingHours: currentBalance,

                hoursBookedFuture: bookedFutureHours,
                projectedBalanceHours: currentBalance - bookedFutureHours,

                isOverdrawn: (currentBalance - bookedFutureHours) < 0
            };
        });

        const total = finalReport.length;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const report = finalReport.slice(startIndex, startIndex + limitNum);

        await logUserAction({ req, action: "get_leave_balance_report", });
        res.status(200).json({
            status: 1,
            message: 'Successfully retrieved leave balance and liability report',
            pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
            data: report
        });
    } catch (err) {
        await logUserAction({ req, responseMessage: err.message, action: "get_leave_balance_report_error", });
        res.status(500).json({ status: 0, message: err.message });
    }
};

// Ensure you have the necessary imports:
// const moment = require('moment'); 
// const LeaveRequest = require('../models/LeaveRequest'); // Your Mongoose Model
// const User = require('../models/User'); // Your Mongoose Model
// const STATUS = require('../config/constants').STATUS; // Your status constants
// const { logUserAction } = require('../utils/logger'); // Your logging utility

exports.getDepartmentWiseLeaveReport = async (req, res) => {
    try {
        // 1. Setup Match Dates (Handles current year by default)
        const { year = moment().year(), fromDate, toDate } = req.query;

        let matchDates = {};

        if (fromDate && toDate) {
            matchDates = { 
                fromDate: { $lte: moment(toDate).endOf('day').toDate() }, 
                toDate: { $gte: moment(fromDate).startOf('day').toDate() }
            };
        } else {
            // Fallback to year if dates are not provided
            const yearStart = moment().year(year).startOf('year').toDate();
            const yearEnd = moment().year(year).endOf('year').toDate();
            matchDates = { fromDate: { $gte: yearStart, $lte: yearEnd } };
        }

        const pipeline = [
            // Filter by date range and status
            { $match: { ...matchDates, status: STATUS.APPROVED } },
            
            // 2. Lookups to populate employee, department, and leave type
            { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'employee' } },
            { $unwind: '$employee' },
            { $lookup: { from: 'departments', localField: 'employee.department', foreignField: '_id', as: 'department' } },
            // Preserve requests where department is null, assigning 'Unassigned' later
            { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } }, 
            { $lookup: { from: 'leavetypes', localField: 'type', foreignField: '_id', as: 'type' } },
            { $unwind: '$type' },

            // --- STEP 1: Aggregate Requests by Department AND Leave Type (Temporary Grouping) ---
            {
                $group: {
                    _id: { deptId: '$department._id', typeId: '$type._id', name: '$type.name' },
                    departmentId: { $first: '$department._id' },
                    departmentName: { $first: { $ifNull: ['$department.name', 'Unassigned Department'] } },
                    leaveTypeName: { $first: '$type.name' },
                    // Sum hours for this unique Dept/Type combination
                    totalLeaveHours: { $sum: '$durationInHours' }, 
                    uniqueEmployees: { $addToSet: '$user' }
                }
            },

            // --- STEP 2: Re-group by Department ONLY (Final Grouping) ---
            {
                $group: {
                    _id: '$departmentId',
                    departmentName: { $first: '$departmentName' },
                    // Sum total hours across all types for the department
                    totalLeaveHours: { $sum: '$totalLeaveHours' }, 
                    
                    // Collect all unique employees from the intermediate groups
                    allEmployees: { $push: '$uniqueEmployees' }, 
                    
                    // CRITICAL FIX: Prepare the summary array with unique keys (k)
                    leaveTypeSummaryArray: { 
                        $push: { 
                            k: '$leaveTypeName', 
                            v: '$totalLeaveHours' 
                        } 
                    }
                }
            },

            // --- STEP 3: Project the Final Output ---
            {
                $project: {
                    _id: 0,
                    departmentId: '$_id',
                    departmentName: 1,
                    totalLeaveHours: 1,
                    
                    // Flatten the array of employee arrays to get a single unique set of employees
                    employeesOnLeave: { 
                        $size: {
                            $reduce: {
                                input: '$allEmployees',
                                initialValue: [],
                                in: { $setUnion: ['$$value', '$$this'] } // Merge and unique the employee IDs
                            }
                        }
                    },
                    
                    // Safely convert the array of summed hours to an object map
                    leaveTypeSummary: { $arrayToObject: '$leaveTypeSummaryArray' } 
                }
            },
            { $sort: { departmentName: 1 } }
        ];

        const reportData = await LeaveRequest.aggregate(pipeline);

        // 4. Fetch total number of employees per department (Outside of aggregation for simplicity)
        const deptEmployeeCounts = await User.aggregate([
            { $group: { _id: '$department', totalEmployees: { $sum: 1 } } }
        ]);
        const deptCountsMap = deptEmployeeCounts.reduce((acc, item) => {
            acc[item._id] = item.totalEmployees;
            return acc;
        }, {});
        
        // Handle unassigned employees count if necessary
        const unassignedDeptCount = await User.countDocuments({ department: { $exists: false } });
        deptCountsMap[null] = unassignedDeptCount;


        // 5. Calculate final percentage and format
        const finalReport = reportData.map(item => {
            // Use the departmentId (which can be null for 'Unassigned Department')
            const totalEmployees = deptCountsMap[item.departmentId] || 0; 
            const absencePercentage = totalEmployees > 0 ? (item.employeesOnLeave / totalEmployees) * 100 : 0;
            return {
                ...item,
                totalEmployeesInDept: totalEmployees,
                absencePercentage: absencePercentage.toFixed(2) + '%'
            };
        });

        await logUserAction({ req, action: "get_department_wise_report" });
        res.status(200).json({
            status: 1,
            message: `Department-wise leave report for ${year}`,
            data: finalReport
        });
    } catch (err) {
        await logUserAction({ req, responseMessage: err.message, action: "get_department_wise_report_error" });
        res.status(500).json({ status: 0, message: err.message });
    }
};