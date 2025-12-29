import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    partNo: { type: String, required: true, unique: true },

    salePrice: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },

    gst: { type: Number, default: 18 },

    stock: { type: Number, default: 0 }
  },
  { timestamps: true }
);

itemSchema.index({ name: "text", partNo: "text" });

export default mongoose.model("Item", itemSchema);
