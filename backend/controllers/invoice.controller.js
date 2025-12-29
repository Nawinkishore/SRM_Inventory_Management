import Invoice from "../models/invoice.model.js";

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
    const invoiceData = req.body;

    // Validation
    if (!invoiceData.invoiceNumber || !invoiceData.customer?.name || !invoiceData.customer?.phone) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: invoiceNumber, customer name, or phone",
      });
    }

    if (invoiceData.customer.phone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits",
      });
    }

    if (!invoiceData.items || invoiceData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invoice must contain at least one item",
      });
    }

    if (Number(invoiceData.amountPaid) > Number(invoiceData.totals.grandTotal)) {
      return res.status(400).json({
        success: false,
        message: "Amount paid cannot exceed grand total",
      });
    }

    // Calculate balance due
    const grandTotal = Number(invoiceData.totals?.grandTotal || 0);
    const amountPaid = Number(invoiceData.amountPaid || 0);
    invoiceData.balanceDue = Math.max(0, grandTotal - amountPaid);

    // Set status based on balance (pre-save hook will also do this)
    if (invoiceData.invoiceStatus !== "canceled") {
      invoiceData.invoiceStatus = invoiceData.balanceDue <= 0 ? "completed" : "draft";
    }

    // Create invoice
    const invoice = await Invoice.create(invoiceData);

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Create Invoice Error:", error);

    // Handle duplicate invoice number
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Invoice number already exists",
      });
    }

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

    // Fix: Handle "overdue" status filter
    if (invoiceStatus && invoiceStatus !== "all") {
      if (invoiceStatus === "overdue") {
        query.balanceDue = { $gt: 0 };
        query.invoiceStatus = { $ne: "canceled" };
      } else {
        query.invoiceStatus = invoiceStatus;
      }
    }

    if (q) {
      query.$or = [
        { invoiceNumber: { $regex: q, $options: "i" } },
        { "customer.name": { $regex: q, $options: "i" } },
        { "customer.phone": { $regex: q, $options: "i" } },
        { "vehicle.registrationNumber": { $regex: q, $options: "i" } },
        { "vehicle.frameNumber": { $regex: q, $options: "i" } },
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
    const updateData = req.body;

    // Prevent updating invoice number
    delete updateData.invoiceNumber;

    // Calculate balance due if amounts are being updated
    if (updateData.amountPaid !== undefined || updateData.totals?.grandTotal !== undefined) {
      const currentInvoice = await Invoice.findById(id);
      
      if (!currentInvoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }

      const grandTotal = updateData.totals?.grandTotal ?? currentInvoice.totals?.grandTotal ?? 0;
      const amountPaid = updateData.amountPaid ?? currentInvoice.amountPaid ?? 0;
      
      updateData.balanceDue = Math.max(0, Number(grandTotal) - Number(amountPaid));
      
      // Update status based on balance (only if not canceled)
      if (updateData.invoiceStatus !== "canceled" && currentInvoice.invoiceStatus !== "canceled") {
        updateData.invoiceStatus = updateData.balanceDue <= 0 ? "completed" : "draft";
      }
    }

    const invoice = await Invoice.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Update Invoice Error:", error);
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