const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Department = require('../models/departments');
const Position = require('../models/positions');
const LeaveBalance = require('../models/LeaveBalance');
const LeaveType = require('../models/requestTypes');

// Create User - Admin only
exports.createUser = async (req, res) => {
  const {
    first_name_kh,
    last_name_kh,
    first_name_en,
    last_name_en,
    username,
    email,
    password,
    confirm_password,
    role,
    department,
    position,
    phone_number,
    gender,
    dob
  } = req.body;

  if (password !== confirm_password) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const departmentData = await Department.findById(department);
  if (!departmentData) {
    return res.status(404).json({ message: "Department not found" });
  }

  const positionData = await Position.findById(position);
  if (!positionData) {
    return res.status(404).json({ message: "Position not found" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    first_name_kh,
    last_name_kh,
    first_name_en,
    last_name_en,
    email,
    username,
    password: hashedPassword,
    role,
    department: departmentData._id,
    position: positionData._id,
    phone_number,
    gender,
    dob
  });

  const leaveTypes = await LeaveType.find({ isActive: true });
  const currentYear = new Date().getFullYear();

  const leaveTypesArray = leaveTypes.map(type => ({
    type: type._id,
    balance: type.maxDaysPerYear,
    code: type.code,
    name: type.name,
  }));

  const leaveBalance = new LeaveBalance({
    user: newUser._id,
    year: currentYear,
    type: leaveTypesArray
  });

  await newUser.save();
  await leaveBalance.save();

  res.status(201).json({ status: 1, message: "User created successfully" });
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
      first_name_kh: user.first_name_kh,
      last_name_en: user.last_name_en,
      first_name_en: user.first_name_en,
      last_name_en: user.last_name_en,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      gender: user.gender,
      perminssions: []
    }
  });
};
