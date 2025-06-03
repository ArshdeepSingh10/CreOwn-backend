const mongoose = require('mongoose');

const companyInfoSchema = new mongoose.Schema({
  brandName: { type: String, required: true },
  slogan: { type: String, required: true },
  brandImage: { type: String, required: true }, // You will store the filename or URL
  productImages: { type: [String], required: true, validate: v => v.length >= 6 }, // at least 6
  aboutUs: { type: String, required: true },
  aboutUsImage: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  whatsappNo: { type: String, required: true },
  facebookId: { type: String, required: true },
  instagramId: { type: String, required: true },
  shopAddress: { type: String, required: true },
  factoryAddress: { type: String, required: true },
  location: { type: String, required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin'} ,// 👈 Add this line
  uniqueName: { type: String, required: true, unique: true } // 👈 NEW
}, { timestamps: true });

module.exports= mongoose.model('CompanyInfo', companyInfoSchema);
