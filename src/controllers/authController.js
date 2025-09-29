const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { logLoginActivity } = require('../middlewares/activityLogger');

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email })
      .populate("department")
      .populate("role");

    if (!user || user.status !== 'Active') {
      await logLoginActivity({
        req,
        statusCode: 401,
        responseMessage: 'User not found',
        userId: null
      });
      return res.status(400).json({ status: -1, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logLoginActivity({
        req,
        statusCode: 400,
        responseMessage: 'Incorrect password',
        userId: user._id
      });
      return res.status(400).json({ status: 0, message: 'Invalid credentials' });
    }

    const payload = {
      userId: user._id,
      role: user.role
    };

    const expires_duration = process.env.token_duration;
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(payload, secret, { expiresIn: expires_duration });
    const decoded = jwt.verify(token, secret);
    const expiresIn = decoded.exp;

    await logLoginActivity({
      req,
      statusCode: 200,
      responseMessage: 'Login successful',
      userId: user._id
    });

    res.json({
      token,
      status: 1,
      message: "Login Successfully",
      user: user,
      expiresIn: expiresIn
    });

  } catch (err) {
    await logLoginActivity({
      req,
      statusCode: 500,
      responseMessage: err.message,
      userId: null
    });
    res.status(500).json({ status: 0, message: err.message });
  }
};
exports.verifyTokenRoute = (req, res) => {
  res.json({ valid: true, user: req.user });
};
