const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Register
exports.signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    next(err);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({ token, status: 'success' });
  } catch (err) {
    next(err);
  }
};
