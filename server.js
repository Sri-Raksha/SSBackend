const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// Middleware to enable CORS
app.use(cors({
  origin: ['https://ss-frontend-three.vercel.app', 'http://localhost:5001'], // Include localhost (frontend) and hosted frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true, // Allow cookies and credentials
}));

// Middleware to parse JSON
app.use(bodyParser.json());

// MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1); // Exit the process if connection fails
  });

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes); // Auth API route

// Health check route
app.get('/', (req, res) => {
  res.status(200).send('API is running.');
});

// Handle unknown routes
app.use((req, res) => res.status(404).json({ message: 'Endpoint not found.' }));

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
