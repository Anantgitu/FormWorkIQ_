const express = require('express');
const router = express.Router();
const OptimizedKit = require('../models/OptimizedKit');

// GET /api/results — Get all projects
router.get('/', async (req, res) => {
    try {
        const kits = await OptimizedKit.find({}, {
            project_id: 1, project_name: 1, status: 1,
            panels_saved: 1, savings_percentage: 1,
            total_cost_savings_inr: 1, total_elements: 1,
            baseline_panels_ordered: 1, optimized_panels_ordered: 1,
            utilization_rate: 1, createdAt: 1
        }).sort({ createdAt: -1 });
        res.json(kits);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/results/latest — Get the most recent result
router.get('/latest', async (req, res) => {
    try {
        const kit = await OptimizedKit.findOne({ status: 'completed' }).sort({ createdAt: -1 });
        if (!kit) return res.status(404).json({ error: 'No completed optimization found' });
        res.json(kit);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/results/:id — Get specific project result
router.get('/:id', async (req, res) => {
    try {
        const kit = await OptimizedKit.findById(req.params.id);
        if (!kit) return res.status(404).json({ error: 'Project not found' });
        res.json(kit);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
