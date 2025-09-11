const ActivityLog = require('../models/activityLog');

exports.getAllActivityLog = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await ActivityLog.countDocuments();

        const data = await ActivityLog.find()
            .populate('userId')

            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            status: 1,
            message: "Successfully",
            data,
            pagination: {
                total,
                page,
                limit,
            }
        });

    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

exports.getActivityLogById = async (req, res) => {
    try {
        const { id } = req.params;

        const activityLog = await ActivityLog.findById(id).populate('userId');

        if (!activityLog) {
            return res.status(404).json({ status: 0, message: "Activity log not found" });
        }

        res.status(200).json({
            status: 1,
            message: "Successfully",
            data: activityLog
        });

    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};