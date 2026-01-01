import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  partNo: String,
  partName: String,
  largeGroup: String,
  tariff: Number,
  revisedMRP: Number,
  CGSTCode: Number,
  SGSTCode: Number,
  IGSTCode: Number,
});

export default mongoose.model("Product", productSchema);
