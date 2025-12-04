import Invoice from "../models/invoice.model.js";

/**
 * Helper: recompute invoice items, totals, balance & status
 * GST% = IGSTCode > 0 ? IGSTCode : (CGSTCode + SGSTCode)
 */
const recomputeInvoice = (items = [], amountPaid = 0, currentStatus) => {
  let subTotal = 0;
  let totalTax = 0;

  const normalizedItems = items.map((item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.revisedMRP) || 0;

    const itemSubtotal = qty * price;
    const gstPercent =
      item.IGSTCode > 0
        ? item.IGSTCode
        : (Number(item.CGSTCode) || 0) + (Number(item.SGSTCode) || 0);

    const taxAmount = Math.round((itemSubtotal * gstPercent) / 100);
    const finalAmount = itemSubtotal + taxAmount;

    subTotal += itemSubtotal;
    totalTax += taxAmount;

    return {
      ...item,
      quantity: qty,
      revisedMRP: price,
      taxAmount,
      finalAmount,
    };
  });

  const grandTotal = subTotal + totalTax;
  const paid = Math.round(Number(amountPaid) || 0);
  const balanceDue = Math.max(0, grandTotal - paid);

  let invoiceStatus;
  if (currentStatus === "canceled") {
    invoiceStatus = "canceled";
  } else {
    invoiceStatus = balanceDue <= 0 ? "completed" : "draft";
  }

  return {
    items: normalizedItems,
    totals: {
      subTotal,
      totalDiscount: 0,
      totalTax,
      grandTotal,
      roundOff: 0,
    },
    amountPaid: paid,
    balanceDue,
    invoiceStatus,
  };
};

// ========================
// Get next invoice number
// ========================
export const getNextInvoiceNumber = async (req, res) => {
  try {
    const lastInvoice = await Invoice.findOne({
      invoiceNumber: { $exists: true },
    })
      .sort({ invoiceNumber: -1 })
      .select("invoiceNumber");

    let nextNumber = "INV-0001";

    if (lastInvoice && lastInvoice.invoiceNumber) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split("-")[1], 10);
      nextNumber = `INV-${String(lastNumber + 1).padStart(4, "0")}`;
    }

    res.status(200).json({
      success: true,
      invoiceNumber: nextNumber,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate invoice number",
      error: error.message,
    });
  }
};

// ========================
// Create invoice
// ========================
export const createInvoice = async (req, res) => {
  try {
    const invoiceData = req.body || {};

    const {
      items,
      totals,
      amountPaid,
      balanceDue,
      invoiceStatus,
    } = recomputeInvoice(
      invoiceData.items || [],
      invoiceData.amountPaid,
      invoiceData.invoiceStatus
    );

    invoiceData.items = items;
    invoiceData.totals = totals;
    invoiceData.amountPaid = amountPaid;
    invoiceData.balanceDue = balanceDue;
    invoiceData.invoiceStatus = invoiceStatus;

    const invoice = await Invoice.create(invoiceData);

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create invoice",
      error: error.message,
    });
  }
};

// ========================
// Get all invoices
// ========================
export const getInvoices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      invoiceType,
      q,
      customerName,
      invoiceStatus,
    } = req.query;

    const query = {};

    if (invoiceType && invoiceType !== "all") {
      query.invoiceType = invoiceType;
    }

    if (invoiceStatus) {
      query.invoiceStatus = invoiceStatus;
    }

    if (q) {
      query.$or = [
        { invoiceNumber: { $regex: q, $options: "i" } },
        { "customer.name": { $regex: q, $options: "i" } },
      ];
    }

    if (customerName) {
      query["customer.name"] = { $regex: customerName, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Invoice.countDocuments(query);

    res.status(200).json({
      success: true,
      data: invoices,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
};

// ========================
// Get single invoice
// ========================
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoice",
      error: error.message,
    });
  }
};

// ========================
// Update invoice
// ========================
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const patchData = req.body || {};

    const existingInvoice = await Invoice.findById(id);
    if (!existingInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // Always recompute using either updated items or existing items
    const items = patchData.items || existingInvoice.items;
    const amountPaid =
      patchData.amountPaid !== undefined
        ? patchData.amountPaid
        : existingInvoice.amountPaid;

    const {
      items: normalizedItems,
      totals,
      amountPaid: normalizedPaid,
      balanceDue,
      invoiceStatus,
    } = recomputeInvoice(
      items,
      amountPaid,
      patchData.invoiceStatus || existingInvoice.invoiceStatus
    );

    const updateData = {
      ...patchData,
      items: normalizedItems,
      totals,
      amountPaid: normalizedPaid,
      balanceDue,
      // only override if not explicitly canceled
      invoiceStatus:
        patchData.invoiceStatus === "canceled"
          ? "canceled"
          : invoiceStatus,
    };

    const invoice = await Invoice.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update invoice",
      error: error.message,
    });
  }
};

// ========================
// Cancel invoice
// ========================
export const cancelInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { invoiceStatus: "canceled" },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice canceled successfully",
      data: invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel invoice",
      error: error.message,
    });
  }
};

// ========================
// Delete invoice
// ========================
export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByIdAndDelete(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete invoice",
      error: error.message,
    });
  }
};
