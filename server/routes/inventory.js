const express = require('express');
const router = express.Router();
const LiveInventory = require('../models/LiveInventory');
const OptimizedKit = require('../models/OptimizedKit');

// GET /api/inventory — Get all panels with optional filters
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.health_status) filter.health_status = req.query.health_status;
        if (req.query.location) filter.current_location = req.query.location;
        if (req.query.panel_type) filter.panel_type = req.query.panel_type;

        const panels = await LiveInventory.find(filter).sort({ health_status: 1, use_count: -1 });

        // Stats summary
        const stats = {
            total: await LiveInventory.countDocuments(),
            excellent: await LiveInventory.countDocuments({ health_status: 'Excellent' }),
            good: await LiveInventory.countDocuments({ health_status: 'Good' }),
            needs_repair: await LiveInventory.countDocuments({ health_status: 'Needs_Repair' }),
            scrap: await LiveInventory.countDocuments({ health_status: 'Scrap' })
        };

        res.json({ panels, stats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/inventory/:qr_code_id — Update panel after QR scan
router.patch('/:qr_code_id', async (req, res) => {
    try {
        const { health_status, current_location } = req.body;
        const update = { last_scanned: new Date() };
        if (health_status) update.health_status = health_status;
        if (current_location) update.current_location = current_location;

        const panel = await LiveInventory.findOneAndUpdate(
            { qr_code_id: req.params.qr_code_id },
            { $set: update, $inc: { use_count: health_status === 'Scrap' ? 0 : 0 } },
            { new: true }
        );
        if (!panel) return res.status(404).json({ error: 'Panel not found' });

        // If scrapped, check if we need to alert
        let alert = null;
        if (health_status === 'Scrap') {
            alert = {
                type: 'SHORTAGE_ALERT',
                message: `Panel ${req.params.qr_code_id} (${panel.panel_type}) marked as SCRAP. Consider ordering a replacement.`,
                panel_type: panel.panel_type
            };
        }

        res.json({ panel, alert });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/inventory/alerts — Get panels needing attention
router.get('/alerts/list', async (req, res) => {
    try {
        const scrapped = await LiveInventory.find({ health_status: 'Scrap' });
        const highUsage = await LiveInventory.find({
            use_count: { $gte: 40 },
            health_status: { $ne: 'Scrap' }
        });
        const needsRepair = await LiveInventory.find({ health_status: 'Needs_Repair' });

        const alerts = [
            ...scrapped.map(p => ({
                id: p._id,
                type: 'SCRAP',
                severity: 'critical',
                qr_code: p.qr_code_id,
                panel_type: p.panel_type,
                location: p.current_location,
                message: `Panel ${p.qr_code_id} is scrapped — order replacement`
            })),
            ...highUsage.map(p => ({
                id: p._id,
                type: 'HIGH_USAGE',
                severity: 'warning',
                qr_code: p.qr_code_id,
                panel_type: p.panel_type,
                location: p.current_location,
                message: `Panel ${p.qr_code_id} has ${p.use_count} uses — inspect before next deployment`
            })),
            ...needsRepair.map(p => ({
                id: p._id,
                type: 'NEEDS_REPAIR',
                severity: 'warning',
                qr_code: p.qr_code_id,
                panel_type: p.panel_type,
                location: p.current_location,
                message: `Panel ${p.qr_code_id} needs repair before use`
            }))
        ];

        res.json({ alerts, counts: { scrap: scrapped.length, high_usage: highUsage.length, needs_repair: needsRepair.length } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
