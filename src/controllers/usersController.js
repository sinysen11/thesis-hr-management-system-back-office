const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const LeaveType = require('../models/leaveTypes');
const LeaveBalance = require('../models/leaveBalance');
const jwt = require('jsonwebtoken');
const Mail = require('../controllers/mailController');
const { logUserAction } = require('../middlewares/activityLogger');

const CLIENT_DOMAIN = process.env.CLIENT_DOMAIN;

const stripPassword = (doc) => {
    if (!doc) return doc;
    const obj = doc.toObject ? doc.toObject() : doc;
    delete obj.password;
    return obj;
};

// CREATE
exports.createUser = async (req, res) => {
    try {
        const body = { ...req.body };

        if (!body.password) {
            return res.status(400).json({status: -1, message: 'Password is required' });
        }
        body.password = await bcrypt.hash(body.password, 10);

        const user = await User.create(body);

        const leaveTypes = await LeaveType.find().lean();
        if (leaveTypes.length) {
            const balances = leaveTypes.map((item) => ({
                userId: user._id,
                year: new Date().getFullYear(),
                type: item._id,
                total: item.total,
            }));

            if (!balances) return
            await LeaveBalance.insertMany(balances);
        }
        await logUserAction({ req, action: "create_user",});
        res.status(201).json({
            status: 1,
            message: 'User created successfully',
            user: stripPassword(user),
        });
    } catch (err) {
        if (err?.code === 11000 && err?.keyPattern?.email) {
            return res.status(400).json({status: 0, message: 'Email already in use' });
        }
        await logUserAction({ req, responseMessage: err.message, action: "create_role",});
        res.status(400).json({status: 0, message: err.message });
    }
};

exports.getUsers = async (req, res) => {
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
                .populate('role')
                .populate('department')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            User.countDocuments(filter),
        ]);

        res.json({
            page,
            limit,
            total,
            data,
            status: 1,
            message: "Successfully"
        });
    } catch (err) {
        res.status(500).json({status: 0, message: err.message });
    }
};

// READ: single
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('role')
            .populate('department')

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({status: 1, message: "Successfully", user});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE
exports.updateUser = async (req, res) => {
    try {
        const updates = { ...req.body };

        // re-hash if password is provided
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const user = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        })
            .populate('role')
            .populate('department')

        if (!user) return res.status(404).json({status: -1, message: 'User not found' });
        await logUserAction({ req, action: "update_user",});
        res.json({
            status: 1,
            message: 'User updated successfully',
            user: stripPassword(user),
        });
    } catch (err) {
        if (err?.code === 11000 && err?.keyPattern?.email) {
            return res.status(400).json({status: 0, message: 'Email already in use' });
        }
        await logUserAction({ req, responseMessage: err.message, action: "update_user",});
        res.status(400).json({status: 0, message: err.message });
    }
};

// DELETE (also removes leave balances for this user)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id).select('-password');
        if (!user) return res.status(404).json({status: -1, message: 'User not found' });

        await logUserAction({ req, action: "delete_user",});
        await LeaveBalance.deleteMany({ user: user._id });

        res.json({status: 1, message: 'User deleted successfully' });
    } catch (err) {
        await logUserAction({ req, responseMessage: err.message, action: "delete_user",});
        res.status(500).json({status: 0, message: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 0, message: "User not found" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "4h" });

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    const resetLink = `${CLIENT_DOMAIN}/reset-password?token=${token}`;

    await Mail.sendForgotPasswordMail({ email, resetLink });

    res.json({ status: 1, message: "Password reset link sent to your email" });
  } catch (err) {
    res.status(500).json({ status: 0, message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ status: 0, message: "User not found" });
    }

    user.password = await bcrypt.hash(new_password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    await Mail.sendResetPasswordConfirmationMail({ email: user.email });

    res.json({ status: 1, message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ status: 0, message: err.message });
  }
};