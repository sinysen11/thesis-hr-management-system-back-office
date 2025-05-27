const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Create User - Admin only
exports.createUser = async (req, res) => {
  const {
    name_kh,
    name_en,
    email,
    password,
    confirm_password,
    role,
    department,
    phone_number,
    gender
  } = req.body;

  if (password !== confirm_password) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name_kh,
    name_en,
    email,
    password: hashedPassword,
    role,
    department,
    phone_number,
    gender
  });

  await newUser.save();

  res.status(201).json({ message: "User created successfully" });
};

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
      email: user.email,
      name_en: user.name_en,
      role: user.role,
      department: user.department,
      perminssions: []
    }
  });
};
