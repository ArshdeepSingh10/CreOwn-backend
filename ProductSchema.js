const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  mainImage: String,
  otherImages: [String],
  image: String,
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }, // 👈 Add this line
  customFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }  
});

module.exports = mongoose.model('Product', productSchema);
