const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const checklistRoutes = require('./routes/checklist');
const applicationRoutes = require('./routes/applications');
const documentRoutes = require('./routes/documents');
const incentiveRoutes = require('./routes/incentives');
const officerRoutes = require('./routes/officer');
const inspectionRoutes = require('./routes/inspections');

app.use('/api/auth', authRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/incentives', incentiveRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/inspections', inspectionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'MAITRI-Setu API' });
});

// SLA Tracker cron job & Keep-Alive ping
require('./services/slaTracker');
require('./services/keepAlive');

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MAITRI-Setu backend running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
