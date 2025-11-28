import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  partNo: String,
  description: String,
  quantity: Number,
  mrp: Number,
  cgst: Number,
  sgst: Number,
  hsn: String,
  amount: Number,
  taxAmount: Number,
  total: Number
});

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  invoiceDate: String,
  customerName: String,
  contactNumber: String,
  items: [ItemSchema],
  nextServiceDate: String,
  nextServiceKms: String,
  subtotal: Number,
  totalTax: Number,
  grandTotal: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Invoice", InvoiceSchema);
