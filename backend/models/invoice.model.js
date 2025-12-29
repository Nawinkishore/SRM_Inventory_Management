import mongoose from "mongoose";

// ITEM SCHEMA
const InvoiceItemSchema = new mongoose.Schema(
  {
    partNo: { type: String, trim: true },
    partName: { type: String, required: true, trim: true },
    largeGroup: { type: String, trim: true },
    tariff: { type: String, trim: true },
    revisedMRP: { type: Number, required: true, min: 0 },
    hsnCode: { type: String, trim: true },
    CGSTCode: { type: Number, default: 0, min: 0 },
    SGSTCode: { type: Number, default: 0, min: 0 },
    IGSTCode: { type: Number, default: 0, min: 0 },

    quantity: { type: Number, default: 1, min: 1 },
    discount: { type: Number, default: 0 },

    cgstAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    igstAmount: { type: Number, default: 0 },
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
      required: true,
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

    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
        match: /^[0-9]{10}$/,
      },
    },

    vehicle: {
      registrationNumber: {
        type: String,
        trim: true,
        uppercase: true,
        default: null,
      },
      frameNumber: {
        type: String,
        trim: true,
        uppercase: true,
        default: null,
      },
      model: {
        type: String,
        trim: true,
        default: null,
      },
      nextServiceKm: {
        type: Number,
        min: 0,
        default: null,
      },
      nextServiceDate: {
        type: Date,
        default: null,
      },
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

    amountPaid: {
      type: Number,
      default: 0,
    },

    balanceDue: {
      type: Number,
      default: 0,
    },

    amountType: {
      type: String,
      default: "cash",
      enum: ["cash", "credit"],
    },
  },
  { timestamps: true }
);

// Pre-save middleware to calculate balance and update status
invoiceSchema.pre("save", function (next) {
  // Calculate balance due
  const grandTotal = this.totals?.grandTotal || 0;
  const amountPaid = this.amountPaid || 0;
  this.balanceDue = Math.max(0, grandTotal - amountPaid);

  // Auto-update status based on balance (only if not manually canceled)
  if (this.invoiceStatus !== "canceled") {
    this.invoiceStatus = this.balanceDue <= 0 ? "completed" : "draft";
  }

  next();
});

// Pre-update middleware for findOneAndUpdate
invoiceSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  
  // Handle both $set and direct updates
  const setUpdate = update.$set || update;
  
  if (setUpdate.amountPaid !== undefined || setUpdate.totals?.grandTotal !== undefined) {
    // We need to fetch the document to calculate properly
    this.model.findOne(this.getQuery()).then((doc) => {
      if (doc) {
        const grandTotal = setUpdate.totals?.grandTotal ?? doc.totals?.grandTotal ?? 0;
        const amountPaid = setUpdate.amountPaid ?? doc.amountPaid ?? 0;
        const balanceDue = Math.max(0, grandTotal - amountPaid);
        
        // Update balance due
        if (update.$set) {
          update.$set.balanceDue = balanceDue;
        } else {
          update.balanceDue = balanceDue;
        }
        
        // Update status if not canceled
        const currentStatus = setUpdate.invoiceStatus ?? doc.invoiceStatus;
        if (currentStatus !== "canceled") {
          const newStatus = balanceDue <= 0 ? "completed" : "draft";
          if (update.$set) {
            update.$set.invoiceStatus = newStatus;
          } else {
            update.invoiceStatus = newStatus;
          }
        }
      }
      next();
    }).catch(next);
  } else {
    next();
  }
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;