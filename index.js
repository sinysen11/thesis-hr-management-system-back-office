require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'thesis-hr-management-system'
})
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error(err));
