const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// Middleware to enable CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Use environment variable for frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // If using cookies or other authentication
  })
);

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

// Importing routes
const authRoutes = require('./routes/auth');

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'API is running smoothly!' });
});

// Setting up API routes
app.use('/api/auth', authRoutes);

// Serve static files from the Frontend folder if needed
if (process.env.NODE_ENV === 'production') {
  // Serve frontend files in production mode
  const frontendPath = path.join(__dirname, '../Frontend');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

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
