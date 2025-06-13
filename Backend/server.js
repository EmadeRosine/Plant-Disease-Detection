// server.js
const express = require('express');
const dotenv = require('dotenv').config(); // Load .env file
const cors = require('cors'); // For cross-origin requests
const { connectDB } = require('./src/config/db'); // Import connectDB function

// Import Routes
const userRoutes = require('./src/routes/userRoutes');
const plantRoutes = require('./src/routes/plantRoutes');
const symptomRoutes = require('./src/routes/symptomRoutes');
const diseaseRoutes = require('./src/routes/diseaseRoutes');
const diagnosisRoutes = require('./src/routes/diagnosisRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all origins (for development)
app.use(express.json()); // For parsing JSON body
app.use(express.urlencoded({ extended: false })); // For parsing URL-encoded data

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/diagnoses', diagnosisRoutes);


// Basic route for testing server
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Agri-Diagnosis Backend API is running!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access backend at http://localhost:${PORT}`);
});