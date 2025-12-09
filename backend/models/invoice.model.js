import mongoose from "mongoose";

// ITEM SCHEMA
const InvoiceItemSchema = new mongoose.Schema(
  {
    partNo: { type: String, trim: true },
    partName: { type: String, required: true, trim: true },
    largeGroup: { type: String, trim: true },
    tariff: { type: Number },
    revisedMRP: { type: Number, required: true, min: 0 },
    hsnCode: { type: String, trim: true },
    CGSTCode: { type: Number, default: 0, min: 0 },
    SGSTCode: { type: Number, default: 0, min: 0 },
    IGSTCode: { type: Number, default: 0, min: 0 },

    quantity: { type: Number, default: 1, min: 1 },
    discount: { type: Number, default: 0 },

    taxAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, default: 0 },
  },
  { _id: false }
);

// INVOICE SCHEMA
const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true, // allows null for quotation
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
    },

    invoiceType: {
      type: String,
      required: true,
      enum: ["job-card", "sales", "advance", "quotation"],
    },

    isInvoice: {
      type: Boolean,
      default: function () {
        return this.invoiceType !== "quotation";
      },
    },

    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
        match: /^[0-9]{10}$/,
      }
    },

    vehicle: {
      nextServiceKm: { type: Number },
      nextServiceDate: { type: Date },
    },

    invoiceStatus: {
      type: String,
      enum: ["draft", "completed", "canceled"],
      default: "draft",
    },

    items: {
      type: [InvoiceItemSchema],
      default: [],
    },

    totals: {
      subTotal: { type: Number, default: 0 },
      totalDiscount: { type: Number, default: 0 },
      totalTax: { type: Number, default: 0 },
      grandTotal: { type: Number, default: 0 },
      roundOff: { type: Number, default: 0 },
    },
    amountPaid : {
      type : Number,
      default : 0
    },
    balanceDue : {
      type : Number,
      default : 0
    },
    amountType:{
      type: String,
      default: 'cash',
      enum : ['cash','credit']
    }
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
