const LeaveRequest = require('../models/leaveRequest');
const STATUS = require('../enums/leaveStatus');


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

        res.status(200).json({ status: 1, message: 'Successfully', data });
    } catch (err) {
        res.status(500).json({ status: 0, message: err.message });
    }
};

exports.getLeaveRequestsReport = async (req, res) => {
    try {
        const { status, name, type, page = 1, limit = 10 } = req.query;

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

        if (name) {
            const user = name.toLowerCase();
            data = data.filter(item =>
                item.user &&
                (
                    (item.user.first_name_en && item.user.first_name_en.toLowerCase().includes(user)) ||
                    (item.user.last_name_en && item.user.last_name_en.toLowerCase().includes(user))
                )
            );
        }

        const total = data.length;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;

        const report = data.slice(startIndex, endIndex);

        const report_date = new Date();

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
        res.status(500).json({ status: 0, message: err.message });
    }
};