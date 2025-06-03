const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  id: Number,
  name: String,
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }, // 👈 Add this line
});

module.exports = mongoose.model('Category', categorySchema);
