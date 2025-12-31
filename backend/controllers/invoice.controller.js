import Invoice from "../models/invoice.model.js";

// ============================
// Generate Next Invoice Number
// ============================
export const getNextInvoiceNumber = async (req, res) => {
  try {
    const lastInvoice = await Invoice.findOne({
      invoiceNumber: { $exists: true },
    })
      .sort({ invoiceNumber: -1 })
      .select("invoiceNumber");

    let nextNumber = "INV-0001";

    if (lastInvoice?.invoiceNumber) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split("-")[1], 10);
      nextNumber = `INV-${String(lastNumber + 1).padStart(4, "0")}`;
    }

    res.status(200).json({ success: true, invoiceNumber: nextNumber });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate invoice number",
      error: error.message,
    });
  }
};

// ============================
// Create Invoice
// ============================
export const createInvoice = async (req, res) => {
  try {
    const data = req.body;

    // -------- Validation --------
    if (!data.invoiceNumber || !data.customer?.name || !data.customer?.phone) {
      return res.status(400).json({
        success: false,
        message: "Missing invoiceNumber, customer name, or phone",
      });
    }

    if (String(data.customer.phone).length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits",
      });
    }

    if (!data.items?.length) {
      return res.status(400).json({
        success: false,
        message: "Invoice must contain at least one item",
      });
    }

    // -------- Compute totals --------
    const totalAmount = data.items.reduce((sum, item) => {
      return sum + Number(item.MRP || 0) * Number(item.quantity || 1);
    }, 0);

    const amountPaid = Number(data.amountPaid || 0);
    const balanceDue = Math.max(totalAmount - amountPaid, 0);

    const invoiceStatus = balanceDue === 0 ? "completed" : "pending";

    // -------- Create invoice --------
    const invoice = await Invoice.create({
      ...data,
      totalAmount,
      amountPaid,
      balanceDue,
      invoiceStatus,
    });

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Create Invoice Error:", error);

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

// ============================
// Get All Invoices
// ============================
export const getInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10, invoiceType, invoiceStatus, q } = req.query;

    const query = {};

    if (invoiceType && invoiceType !== "all") query.invoiceType = invoiceType;
    if (invoiceStatus && invoiceStatus !== "all")
      query.invoiceStatus = invoiceStatus;

    if (q) {
      query.$or = [
        { invoiceNumber: { $regex: q, $options: "i" } },
        { "customer.name": { $regex: q, $options: "i" } },
        { "customer.phone": { $regex: q, $options: "i" } },
        { "vehicle.registrationNumber": { $regex: q, $options: "i" } },
        { "vehicle.frameNumber": { $regex: q, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Invoice.countDocuments(query);

    res.status(200).json({
      success: true,
      data: invoices,
      meta: {
        page: Number(page),
        limit: Number(limit),
        totalDocs: total,
        totalPages: Math.ceil(total / limit),
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

// ============================
// Get Single Invoice
// ============================
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice)
      return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching invoice",
      error: error.message,
    });
  }
};

// ============================
// Update Invoice
// ============================
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;

    // never allow invoice number change
    delete update.invoiceNumber;

    const invoice = await Invoice.findById(id);
    if (!invoice)
      return res.status(404).json({ success: false, message: "Not found" });

    // recompute totals
    const totalAmount =
      update.totalAmount !== undefined
        ? Number(update.totalAmount)
        : invoice.totalAmount;

    const amountPaid =
      update.amountPaid !== undefined
        ? Number(update.amountPaid)
        : invoice.amountPaid;

    const balanceDue = Math.max(totalAmount - amountPaid, 0);
    const invoiceStatus = balanceDue === 0 ? "completed" : "pending";

    update.totalAmount = totalAmount;
    update.amountPaid = amountPaid;
    update.balanceDue = balanceDue;
    update.invoiceStatus = invoiceStatus;

    const updated = await Invoice.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update invoice",
      error: error.message,
    });
  }
};

// ============================
// Delete Invoice
// ============================
export const deleteInvoice = async (req, res) => {
  try {
    const deleted = await Invoice.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ success: false, message: "Not found" });

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
