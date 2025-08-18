const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Applicant = require('../../models/website/applicant');

const JWT_SECRET = process.env.JWT_SECRET;

exports.registerApplicant = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;

    const existing = await Applicant.findOne({ email });
    if (existing) {
      return res.status(400).json({ status: 0, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const applicant = await Applicant.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      phone,
    });

    res.status(201).json({ status: 1, message: 'Registered Successfully', applicant });
  } catch (err) {
    res.status(500).json({ status: 0, message: err.message });
  }
};

exports.loginApplicant = async (req, res) => {
  try {
    const { email, password } = req.body;

    const applicant = await Applicant.findOne({ email });
    if (!applicant) {
      return res.status(404).json({ status: 0, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, applicant.password);
    if (!isMatch) {
      return res.status(400).json({ status: 0, message: 'Incorrect password' });
    }

    const token = jwt.sign({ id: applicant._id }, JWT_SECRET, { expiresIn: '4h' });

    res.json({
      status: 1,
      message: 'Login Successfully',
      token,
      applicant: applicant
    });
  } catch (err) {
    res.status(500).json({ status: 0, message: err.message });
  }
};
