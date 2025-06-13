
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const plantRoutes = require('./routes/plantRoutes');
const symptomRoutes = require('./routes/symptomRoutes');
const diseaseRoutes = require('./routes/diseaseRoutes');
const diagnosisRoutes = require('./routes/diagnosisRoutes'); 

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/diagnoses', diagnosisRoutes); 


app.get('/', (req, res) => {
    res.send('Expert System Backend API is running!');
});

module.exports = app;