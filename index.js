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
      name_kh: 'អ្នកគ្រប់គ្រងជាន់ខ្ពស់',
      name_en: 'Super Admin',
      email: 'super.admin@example.com',
      password: hashedPassword,
      role: 'admin',
      department: 'Administration',
      phone_number: '012345678',
      gender: 'male'
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
