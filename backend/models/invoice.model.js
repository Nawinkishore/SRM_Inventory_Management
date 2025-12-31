import mongoose from "mongoose";

const InvoiceItemSchema = new mongoose.Schema(
  {
    partNo: { type: String, trim: true },
    partName: { type: String, required: true, trim: true },
    largeGroup: { type: String, trim: true },
    tariff: { type: String, trim: true },

    MRP: { type: Number, required: true, min: 0 },

    quantity: { type: Number, required: true, min: 1 },

    gst: { type: Number, required: true, min: 0 },

    rate: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
    },

    invoiceType: {
      type: String,
      required: true,
      enum: ["job-card", "sales", "advance"],
    },

    customer: {
      name: { type: String, required: true, trim: true },
      phone: {
        type: String,
        required: true,
        trim: true,
        maxlength: 10,
      },
    },

    vehicle: {
      registrationNumber: {
        type: String,
        trim: true,
        uppercase: true,
        default: null,
      },
      frameNumber: { type: String, trim: true, uppercase: true, default: null },
      model: { type: String, trim: true, default: null },
      nextServiceKm: { type: Number, min: 0, default: null },
      nextServiceDate: { type: Date, default: null },
    },

    invoiceStatus: {
      type: String,
      enum: ["completed", "pending"],
      default: "pending",
    },

    items: {
      type: [InvoiceItemSchema],
      default: [],
    },

    totalAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },

    amountType: {
      type: String,
      default: "cash",
      enum: ["cash", "credit"],
    },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
