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
  stock :{
    type: Number,
    default: 0
  },
  salePrice : {
    type: Number,
    default: 0
  },
  purchasePrice : {
    type: Number,
    default: 0
  }
});


productSchema.index({partName : 1});
productSchema.index({partNo : 1});
export default mongoose.model("Product", productSchema);
