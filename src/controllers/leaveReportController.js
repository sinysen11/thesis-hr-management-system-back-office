const LeaveRequest = require('../models/leaveRequest');
const STATUS = require('../enums/leaveStatus');
const moment = require('moment');
const { logUserAction } = require('../middlewares/activityLogger');

exports.getLeaveRequestsReportForApprover = async (req, res) => {
    try {
        const { user_id } = req.params;
        const filter = {};

        if (user_id) {
            filter.approver = user_id;
            filter.status = { $ne: STATUS.CANCELLED };
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
        await logUserAction({ req, action: "get_leave_report", });
        res.status(200).json({ status: 1, message: 'Successfully', data });
    } catch (err) {
        await logUserAction({ req, responseMessage: err.message, action: "get_leave_report", });
        res.status(500).json({ status: 0, message: err.message });
    }
};

exports.getLeaveRequestsReport = async (req, res) => {
    try {
        const { status, name, type, fromDate, toDate, page = 1, limit = 10 } = req.query;

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

        if (status) {
            data = data.filter(item => item.status === status);
        }

        if (type) {
            data = data.filter(item => item.type && item.type.code === type);
        }

        if (fromDate || toDate) {
            const filterStart = fromDate ? moment(fromDate).startOf('day') : moment(0);
            const filterEnd = toDate ? moment(toDate).endOf('day') : moment();

            data = data.filter(item => {
                const leaveStart = moment(item.fromDate);
                const leaveEnd = moment(item.toDate);
                return leaveEnd.isSameOrAfter(filterStart) && leaveStart.isSameOrBefore(filterEnd);
            });
        }

        if (name) {
            const searchName = name.toLowerCase().trim();

            data = data.filter(item => {
                const employee = item.user;
                const approver = item.approver;

                const checkUserMatch = (user) => {
                    if (!user) return false;

                    const firstName = user.first_name_en ? user.first_name_en.toLowerCase() : '';
                    const lastName = user.last_name_en ? user.last_name_en.toLowerCase() : '';

                    const fullName = `${firstName} ${lastName}`.trim();
                    const reversedName = `${lastName} ${firstName}`.trim();

                    const matchesIndividualName = firstName.includes(searchName) || lastName.includes(searchName);

                    const matchesFullName = fullName.includes(searchName) || reversedName.includes(searchName);

                    return matchesIndividualName || matchesFullName;
                };

                return checkUserMatch(employee) || checkUserMatch(approver);
            });
        }

        const total = data.length;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;

        const report = data.slice(startIndex, endIndex);

        const report_date = new Date();
        await logUserAction({ req, action: "get_leave_report", });
        res.status(200).json({
            status: 1,
            message: 'Successfully',
            date: report_date,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum
            },
            data: report
        });
    } catch (err) {
        await logUserAction({ req, responseMessage: err.message, action: "get_leave_report", });
        res.status(500).json({ status: 0, message: err.message });
    }
};