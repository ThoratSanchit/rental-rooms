const express = require('express');
const cors = require('cors');
require('dotenv').config();

// const connectDB = require('./config/database');

const app = express();

// Connect to database
// connectDB();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://work-1-njnudoadvnxutjxt.prod-runtime.all-hands.dev']
    : ['http://localhost:3000', 'http://localhost:12000'],
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/rooms', (req, res) => {
  res.json({ success: true, data: [], pagination: { current: 1, pages: 1, total: 0 } });
});

app.get('/api/rooms/:id', (req, res) => {
  res.json({ success: true, data: { _id: req.params.id, title: 'Test Room' } });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 12001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server running on port ${PORT}`);
});