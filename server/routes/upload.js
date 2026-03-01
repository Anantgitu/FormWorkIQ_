const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const OptimizedKit = require('../models/OptimizedKit');
const LiveInventory = require('../models/LiveInventory');

const upload = multer({ storage: multer.memoryStorage() });
const PYTHON_URL = process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';

// POST /api/upload — Upload JSON project data, trigger optimization
router.post('/', upload.single('file'), async (req, res) => {
    try {
        let projectData;

        if (req.file) {
            // File upload path
            const fileContent = req.file.buffer.toString('utf-8');
            projectData = JSON.parse(fileContent);
        } else if (req.body && req.body.project_id) {
            // Direct JSON body path
            projectData = req.body;
        } else {
            return res.status(400).json({ error: 'No file or JSON body provided' });
        }

        // Save initial record to DB
        const kit = await OptimizedKit.create({
            project_id: projectData.project_id,
            project_name: projectData.project_name || 'Unnamed Project',
            status: 'processing',
            raw_input: projectData
        });

        // Seed mock inventory panels if empty
        const invCount = await LiveInventory.countDocuments();
        if (invCount === 0) {
            await seedInventory(projectData.project_id);
        }

        // Call Python optimization engine
        let optimizationResult;
        try {
            const response = await axios.post(`${PYTHON_URL}/optimize`, projectData, {
                timeout: 30000
            });
            optimizationResult = response.data;
        } catch (pyErr) {
            console.error('Python engine error:', pyErr.message);
            await OptimizedKit.findByIdAndUpdate(kit._id, {
                status: 'error',
                error_message: `Python engine unavailable: ${pyErr.message}`
            });
            return res.status(503).json({
                error: 'Optimization engine unavailable',
                kit_id: kit._id,
                message: 'Data saved. Start the Python engine and retry at /api/results/' + kit._id
            });
        }

        // Update with results
        await OptimizedKit.findByIdAndUpdate(kit._id, {
            status: 'completed',
            ...optimizationResult
        });

        res.json({
            success: true,
            kit_id: kit._id,
            project_id: projectData.project_id,
            summary: {
                total_elements: optimizationResult.total_elements,
                panels_saved: optimizationResult.panels_saved,
                savings_percentage: optimizationResult.savings_percentage,
                total_cost_savings_inr: optimizationResult.total_cost_savings_inr
            }
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: err.message });
    }
});

async function seedInventory(projectId) {
    const panelTypes = [
        { type: 'P-2x1', count: 80 },
        { type: 'P-1x1', count: 60 },
        { type: 'P-0.5x1', count: 40 },
        { type: 'P-0.3x1', count: 30 }
    ];
    const locations = ['Yard', 'Floor_1_Zone_A', 'Floor_1_Zone_B', 'Floor_2_Zone_A'];
    const statuses = ['Excellent', 'Excellent', 'Excellent', 'Good', 'Good', 'Needs_Repair'];
    const panels = [];

    for (const pt of panelTypes) {
        for (let i = 1; i <= pt.count; i++) {
            const useCount = Math.floor(Math.random() * 20);
            panels.push({
                qr_code_id: `QR-${pt.type}-${String(i).padStart(3, '0')}`,
                panel_type: pt.type,
                current_location: locations[Math.floor(Math.random() * locations.length)],
                health_status: useCount > 15 ? 'Needs_Repair' : statuses[Math.floor(Math.random() * statuses.length)],
                use_count: useCount,
                max_reuses: 50,
                project_id: projectId
            });
        }
    }
    await LiveInventory.insertMany(panels, { ordered: false }).catch(() => { });
}

module.exports = router;
