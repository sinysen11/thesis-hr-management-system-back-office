const LeaveBalance = require('../models/leaveBalance');

exports.getLeaveBalanceByUserId = async (req, res) => {
    try {
        const { user_id } = req.params;
        const balances = await LeaveBalance.find({ userId: user_id })
        .populate('type')

        res.status(200).json({
            user_id,
            leaveBalances: balances,
            message: "Successfully",
            status: 1
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
