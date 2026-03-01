const mongoose = require('mongoose');

const FormworkCatalogSchema = new mongoose.Schema({
    panel_type_id: { type: String, required: true, unique: true },
    width_m: Number,
    height_m: Number,
    area_sqm: Number,
    max_reuses: Number,
    cost_per_unit_inr: Number
}, { timestamps: true });

module.exports = mongoose.model('FormworkCatalog', FormworkCatalogSchema);
