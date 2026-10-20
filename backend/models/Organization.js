const mongoose = require('mongoose');


const organizationSchema = new mongoose.Schema({
name: { type: String, required: true },
email: { type: String, required: true },
address: String,
createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Organization', organizationSchema);