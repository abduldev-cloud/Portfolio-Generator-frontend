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

app.use('/api/portfolio', portfolioRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/ats', atsRoutes);

app.get('/', (req, res) => {
    res.send('Portfolio Generator API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
