const mongoose = require('mongoose');

const OptimizedKitSchema = new mongoose.Schema({
    project_id: { type: String, required: true },
    project_name: String,
    status: { type: String, enum: ['processing', 'completed', 'error'], default: 'processing' },
    total_elements: Number,
    baseline_panels_ordered: Number,
    optimized_panels_ordered: Number,
    panels_saved: Number,
    savings_percentage: Number,
    total_cost_savings_inr: Number,
    utilization_rate: Number,
    boq: [mongoose.Schema.Types.Mixed],
    daily_kits: [mongoose.Schema.Types.Mixed],
    reuse_links: [mongoose.Schema.Types.Mixed],
    raw_input: mongoose.Schema.Types.Mixed,
    error_message: String
}, { timestamps: true });

module.exports = mongoose.model('OptimizedKit', OptimizedKitSchema);
