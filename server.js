require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'CineScope API is running' });
});

app.use('/api/auth', authRoutes);

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is required to start the server');
  }

  return mongoose.connect(mongoUri);
};

if (require.main === module) {
  const port = process.env.PORT || 5000;

  connectDB()
    .then(() => {
      app.listen(port, () => {
        console.log(`CineScope API listening on port ${port}`);
      });
    })
    .catch((error) => {
      console.error('Failed to start CineScope API:', error.message);
      process.exit(1);
    });
}

module.exports = app;
module.exports.connectDB = connectDB;
