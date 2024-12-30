const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Middleware for basic validation
const validateRequest = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        console.error('Validation failed: Email or password missing');
        return res.status(400).json({ message: 'Email and password are required' });
    }
    next();
};

// Signup Route
router.post('/signup', validateRequest, async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Signup Request Body:', req.body);

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.warn(`Signup failed: User with email ${email} already exists`);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the user in MongoDB
        const newUser = await User.create({ email, password: hashedPassword });

        console.log(`User registered successfully: ${email}`);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Login Route
router.post('/login', validateRequest, async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Login Request Body:', req.body);

        // Find user in MongoDB
        const user = await User.findOne({ email });
        if (!user) {
            console.warn(`Login failed: User with email ${email} does not exist`);
            return res.status(400).json({ message: 'User does not exist' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password Validation:', isPasswordValid);

        if (!isPasswordValid) {
            console.warn('Login failed: Invalid password');
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Generated Token:', token);

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
