import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
  // Removed userId field
  orderName: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  items: [
    {
      itemNumber: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      total: { type: Number, required: true },
    }
  ]
}, { timestamps: true });

export default mongoose.model("Purchase", purchaseSchema);
