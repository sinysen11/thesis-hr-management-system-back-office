const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Applicant = require('../../models/website/applicant');
const Mail = require('../../controllers/mailController');

const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_DOMAIN = process.env.CLIENT_DOMAIN;

exports.registerApplicant = async (req, res) => {
  try {
    const { first_name, last_name, email, password, confirm_password, phone, sex, dob, current_address, telegram,  } = req.body;

    const existing = await Applicant.findOne({ email });
    if (existing) {
      return res.status(400).json({ status: 0, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedConfirmPassword = await bcrypt.hash(confirm_password, 10);

    const applicant = await Applicant.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      confirm_password: hashedConfirmPassword,
      phone,
      sex,
      dob,
      telegram,
      current_address
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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const applicant = await Applicant.findOne({ email });
    if (!applicant) {
      return res.status(404).json({ status: 0, message: "User not found" });
    }

    const token = jwt.sign({ id: applicant._id }, process.env.JWT_SECRET, { expiresIn: "4h" });

    applicant.resetToken = token;
    applicant.resetTokenExpiry = Date.now() + 3600000;
    await applicant.save();

    const resetLink = `${CLIENT_DOMAIN}/website/reset-password?token=${token}`;

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
    const applicant = await Applicant.findById(decoded.id);

    if (!applicant) {
      return res.status(400).json({ status: 0, message: "Applicant not found" });
    }

    applicant.password = await bcrypt.hash(new_password, 10);
    applicant.resetToken = undefined;
    applicant.resetTokenExpiry = undefined;
    await applicant.save();

    await Mail.sendResetPasswordConfirmationMail({ email: applicant.email });

    res.json({ status: 1, message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ status: 0, message: err.message });
  }
};