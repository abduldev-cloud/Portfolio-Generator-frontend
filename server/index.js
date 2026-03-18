const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Routes
const portfolioRoutes = require('./routes/portfolio');
const resumeRoutes = require('./routes/resume');
const atsRoutes = require('./routes/ats');
const githubRoutes = require('./routes/github');
const interviewRoutes = require('./routes/interview');
const authRoutes = require('./routes/auth');

app.use('/api/portfolio', portfolioRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Portfolio Generator API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
