import mongoose from 'mongoose';

const InvoiceItemSchema = new mongoose.Schema(
  {
    partNo: { type: String, trim: true },
    partName: { type: String, required: true, trim: true },
    largeGroup: { type: String, trim: true },
    tariff: { type: Number },
    revisedMRP: { type: Number, required: true, min: 0 },

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

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
    },

    invoiceType: {
      type: String,
      required: true,
      enum: ['job-card', 'sales', 'advance', 'quotation'],
    },

    isInvoice: {
      type: Boolean,
      default: function () {
        return this.invoiceType !== 'quotation';
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
      },
      address: { type: String, trim: true },
    },

    vehicle: {
      model: { type: String, trim: true },
      registrationNumber: { type: String, trim: true },
      vin: { type: String, trim: true },
      kmReading: { type: Number },
    },

    invoiceStatus: {
      type: String,
      enum: ['draft', 'completed', 'canceled'],
      default: 'draft',
    },

    remarks: {
      type: String,
      trim: true,
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
  },
  { timestamps: true }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
