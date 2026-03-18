const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// In-memory user store (production would use MySQL)
const users = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@astra.dev',
        password: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        createdAt: new Date().toISOString()
    }
];

let nextUserId = 2;

// Activity log
const activityLog = [];

function logActivity(action, user, details = '') {
    activityLog.unshift({
        id: activityLog.length + 1,
        action,
        user: user || 'system',
        details,
        timestamp: new Date().toISOString()
    });
    // Keep only last 100 entries
    if (activityLog.length > 100) activityLog.pop();
}

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = users.find(u => u.username === username || u.email === username);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    logActivity('login', user.username, 'Successful login');

    res.json({
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
});

// Register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const exists = users.find(u => u.username === username || u.email === email);
    if (exists) {
        return res.status(409).json({ error: 'Username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: nextUserId++,
        username,
        email,
        password: hashedPassword,
        role: 'user',
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    logActivity('register', username, 'New user registered');

    const token = jwt.sign(
        { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.status(201).json({
        token,
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        }
    });
});

// Get current user profile
router.get('/me', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
    });
});

// Admin: Get all users
router.get('/users', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }

    res.json(users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt
    })));
});

// Admin: Get platform stats
router.get('/admin/stats', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }

    res.json({
        totalUsers: users.length,
        adminUsers: users.filter(u => u.role === 'admin').length,
        regularUsers: users.filter(u => u.role === 'user').length,
        recentActivity: activityLog.slice(0, 20),
        features: {
            portfolio: { status: 'active', description: 'Portfolio ZIP Generator' },
            resume: { status: 'active', description: 'Resume Builder with 6 Templates' },
            ats: { status: 'active', description: 'AI ATS Analysis Engine' },
            interview: { status: 'active', description: 'AI Interview Simulator' },
            github: { status: 'active', description: 'GitHub Profile Sync' }
        },
        serverUptime: process.uptime(),
        memoryUsage: process.memoryUsage()
    });
});

// Admin: Get activity log
router.get('/admin/activity', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }
    res.json(activityLog);
});

// Admin: Toggle feature (mock)
router.post('/admin/feature-toggle', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }

    const { feature, status } = req.body;
    logActivity('feature_toggle', req.user.username, `${feature} set to ${status}`);
    res.json({ message: `Feature ${feature} is now ${status}` });
});

module.exports = router;
