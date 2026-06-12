const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Database Connection
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.warn('\n==================================================================');
    console.warn('WARNING: MONGODB_URI is not defined in your .env file!');
    console.warn('The contact form submission will fail until you provide a connection string.');
    console.warn('Please add your MongoDB Atlas connection string to .env.');
    console.warn('==================================================================\n');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Connection Error: ${error.message}`);
    console.warn('The server will continue running, but database operations will fail.');
  }
};

connectDB();

// 2. Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Serve Frontend Static Files
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/projects', express.static(path.join(__dirname, 'projects')));

// 4. API Routes
app.use('/api/contact', require('./routes/contact'));

// 5. Catch-all fallback for non-API routes (serves main index.html)
app.get('*', (req, res) => {
  // If request is for an API that doesn't exist, return 404
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'API route not found' });
  }
  // Otherwise, fallback to the index.html page
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 6. Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Error Middleware]:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong on the server!'
  });
});

// 7. Start Server
app.listen(PORT, () => {
  console.log(`\n==================================================================`);
  console.log(`[Server] Maulik Vora Portfolio is running on port ${PORT}`);
  console.log(`[Server] Local URL: http://localhost:${PORT}`);
  console.log(`==================================================================\n`);
});
