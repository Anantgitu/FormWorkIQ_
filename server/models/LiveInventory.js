const mongoose = require('mongoose');

const LiveInventorySchema = new mongoose.Schema({
    qr_code_id: { type: String, required: true, unique: true },
    panel_type: { type: String, required: true },
    current_location: { type: String, default: 'Yard' },
    health_status: {
        type: String,
        enum: ['Excellent', 'Good', 'Needs_Repair', 'Scrap'],
        default: 'Excellent'
    },
    use_count: { type: Number, default: 0 },
    max_reuses: { type: Number, default: 50 },
    last_scanned: { type: Date, default: Date.now },
    assigned_kit: { type: String, default: null },
    project_id: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('LiveInventory', LiveInventorySchema);
