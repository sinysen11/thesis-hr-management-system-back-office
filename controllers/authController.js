const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '4h' }
  );

  res.json({
    token,
    status: '1',
    message: "Login successful",
    user: {
      id: user._id,
      first_name_kh: user.first_name_kh,
      last_name_en: user.last_name_en,
      first_name_en: user.first_name_en,
      last_name_en: user.last_name_en,
      email: user.email,
      role: user.role,
      department: user.department,
      gender: user.gender,
    }
  });
};

exports.verifyTokenRoute = (req, res) => {
  res.json({ valid: true, user: req.user });
};
