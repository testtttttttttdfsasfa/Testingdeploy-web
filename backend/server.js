const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const financeRoutes = require('./routes/finance');
const eventsRoutes = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - CORS untuk Pure JavaScript frontend
app.use(cors({
  origin: [
    'http://localhost:5500',      // Live Server
    'http://127.0.0.1:5500',      // Live Server (IP)
    'http://localhost:8000',      // Python/http-server
    'http://127.0.0.1:8000',      // Python/http-server (IP)
    'http://localhost:3000',      // Alternative port
    'http://localhost:5173',      // Vite (legacy)
    process.env.CORS_ORIGIN       // Custom from .env
  ].filter(Boolean),
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/finance', financeRoutes);
app.use('/api', eventsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Gereja Damai Kristus API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Finance API: http://localhost:${PORT}/api/finance`);
  console.log(`📅 Events API: http://localhost:${PORT}/api/events`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});
