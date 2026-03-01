const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const uploadRoute = require('./routes/upload');
const resultsRoute = require('./routes/results');
const inventoryRoute = require('./routes/inventory');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/upload', uploadRoute);
app.use('/api/results', resultsRoute);
app.use('/api/inventory', inventoryRoute);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'FormworkAPI v1.0', time: new Date().toISOString() });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        app.listen(PORT, () => {
            console.log(`🚀 Node.js server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
        console.log('⚠️  Starting server without MongoDB (results will not persist)');
        app.listen(PORT, () => {
            console.log(`🚀 Node.js server running on http://localhost:${PORT}`);
        });
    });

module.exports = app;
