// src/controllers/userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models'); // Import the db object
const User = db.User;

// Helper function to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Please enter all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ where: { username } });
    if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    try {
        const user = await User.create({
            username,
            password_hash,
            role: role || 'farmer', // Default role to 'farmer' if not provided
        });

        if (user) {
            res.status(201).json({
                id: user.id,
                username: user.username,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ error: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    // Check for user
    const user = await User.findOne({ where: { username } });

    if (user && (await bcrypt.compare(password, user.password_hash))) {
        res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            token: generateToken(user.id),
        });
    } else {
        res.status(400).json({ error: 'Invalid credentials' });
    }
};

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
    // req.user is set by the protect middleware
    res.json(req.user);
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
};