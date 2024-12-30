const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// Middleware to enable CORS for all routes
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Allow requests from frontend URL; customize this for production
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Define allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Define allowed headers
  credentials: true, // Enable cookies and credentials
}));

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// MongoDB Atlas connection
const mongoUri = process.env.MONGO_URI; // Ensure this is set in your `.env` file
if (!mongoUri) {
  console.error('Error: MONGO_URI is not defined in the .env file.');
  process.exit(1); // Exit the application if no MongoDB URI is provided
}

mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err.message);
    process.exit(1); // Exit the application on connection failure
  });

// Debugging environment variables (optional, for development only)
if (process.env.NODE_ENV !== 'production') {
  console.log('MONGO_URI:', process.env.MONGO_URI);
  console.log('JWT_SECRET:', process.env.JWT_SECRET);
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
}

// Importing routes
const authRoutes = require('./routes/auth');

// Setting up routes
app.use('/api/auth', authRoutes);

// Serve static frontend files
const buildPath = path.join(__dirname, 'build');
if (process.env.SERVE_FRONTEND === 'true') {
  app.use(express.static(buildPath));

  // Catch-all route to serve frontend for unknown routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Health Check Route
app.get('/api', (req, res) => {
  res.status(200).send('API is running.');
});

// Catch-all route to handle invalid API endpoints
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
