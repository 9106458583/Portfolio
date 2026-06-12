const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Connect to MongoDB Atlas
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.warn('[Database] MONGODB_URI not configured. Skipping MongoDB connection.');
    return;
  }
  try {
    await mongoose.connect(mongoURI);
    console.log('[Database] MongoDB Connected successfully');
  } catch (error) {
    console.error('[Database] MongoDB Connection Error:', error.message);
  }
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import the existing contact controller
const { submitContactForm } = require('../controllers/contactController');

// Route handler
app.post('/api/contact', async (req, res, next) => {
  await connectDB();
  next();
}, submitContactForm);

module.exports = app;
