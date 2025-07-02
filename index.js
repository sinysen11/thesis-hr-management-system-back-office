require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');
const User = require('./models/userModel');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 3000;

const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'super.admin@gmail.com' });
    if (adminExists) return;

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const adminUser = new User({
      first_name_kh: 'អ្នកគ្រប់គ្រង',
      last_name_kh: 'ជាន់ខ្ពស់',
      first_name_en: 'Super',
      last_name_en: 'Admin',
      username: 'superadmin',
      email: 'super.admin@example.com',
      password: hashedPassword,
      role: 'admin',
      department: '6836716319f5d7315fb5a517',
      position: "6836716319f5d7315fb5a517",
      phone_number: '012345678',
      gender: 'male',
      dob: new Date('1990-01-01')
    });


    await adminUser.save();
    console.log('Default admin user created.');
  } catch (error) {
    console.error('Failed to create admin user:', error.message);
  }
};

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'thesis-hr-management-system'
})
  .then(() => {
    console.log('MongoDB connected');
    createDefaultAdmin();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error(err));
