const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email })
  .populate("department")
  .populate("role")
  
  if (!user) {
    return res.status(400).json({status: -1, message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({status: 0, message: 'Invalid credentials' });
  }

  const payload = {
    userId: user._id, 
    role: user.role
  }

  const expires_duration = process.env.token_duration;
  const secret = process.env.JWT_SECRET;
  const token = jwt.sign(payload, secret, { expiresIn: expires_duration });
  const decoded = jwt.verify(token, secret );
  const expiresIn = decoded.exp;

  res.json({
    token,
    status: 1,
    message: "Login Successfully",
    user: user,
    expiresIn: expiresIn
  });
};

exports.verifyTokenRoute = (req, res) => {
  res.json({ valid: true, user: req.user });
};
