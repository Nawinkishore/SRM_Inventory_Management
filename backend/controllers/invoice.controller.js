import Invoice from "../models/invoice.model.js";
import { calculateTotals } from "../utils/calculateTotals.js";

// ========================
// CREATE INVOICE
// ========================
export const createInvoice = async (req, res) => {
  try {
    const data = req.body;

    // Invoice number must be present (except quotations)
    if (data.invoiceType !== "quotation" && !data.invoiceNumber) {
      return res.status(400).json({
        success: false,
        message: "Invoice number missing",
      });
    }

    // Recalculate totals before saving
    calculateTotals(data);

    await Invoice.create(data);

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================== Filter + Pagination GET INVOICES
// ========================
export const getInvoices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      invoiceType,
      invoiceStatus,
      phone,
      invoiceNumber,
      q,
      customerName,
    } = req.query;

    const filters = {};

    // Invoice type filter
    // - If invoiceType is "quotation" -> ONLY quotations
    // - If invoiceType is "all" OR not provided -> EXCLUDE quotations
    // - Else (sales, job-card, etc) -> ONLY that type
    if (invoiceType === "quotation") {
      filters.invoiceType = "quotation";
    } else if (!invoiceType || invoiceType === "all") {
      filters.invoiceType = { $ne: "quotation" };
    } else {
      filters.invoiceType = invoiceType;
    }

    if (invoiceStatus) filters.invoiceStatus = invoiceStatus;
    if (phone) filters["customer.phone"] = phone;
    if (invoiceNumber) filters.invoiceNumber = invoiceNumber;

    // dedicated customer name filter
    if (customerName) {
      filters["customer.name"] = { $regex: customerName, $options: "i" };
    }

    // general search (name + invoiceNumber)
    if (q) {
      filters.$or = [
        { "customer.name": { $regex: q, $options: "i" } },
        { invoiceNumber: { $regex: q, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [invoices, total] = await Promise.all([
      Invoice.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Invoice.countDocuments(filters),
    ]);

    return res.status(200).json({
      success: true,
      data: invoices,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// GET NEXT INVOICE NUMBER
// ========================
export const getNextInvoiceNumber = async (req, res) => {
  try {
    const lastInvoice = await Invoice.findOne()
      .sort({ createdAt: -1 })
      .select("invoiceNumber");

    let nextNumber = 1;

    if (lastInvoice?.invoiceNumber) {
      nextNumber = parseInt(lastInvoice.invoiceNumber) + 1;
    }

    const formatted = String(nextNumber);

    return res.status(200).json({
      success: true,
      invoiceNumber: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// GET BY ID
// ========================
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    return res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// UPDATE INVOICE
// ========================
export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice)
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });

    if (invoice.invoiceStatus === "canceled")
      return res.status(400).json({
        success: false,
        message: "Canceled invoice cannot be edited",
      });

    const updates = req.body;

    // Block invoice number change
    if (
      updates.invoiceNumber &&
      updates.invoiceNumber !== invoice.invoiceNumber
    ) {
      return res.status(400).json({
        success: false,
        message: "Invoice number cannot be modified",
      });
    }

    // Merge changes
    Object.assign(invoice, updates);

    // Recalculate totals if items modified
    if (updates.items) calculateTotals(invoice);

    await invoice.save();

    return res.status(200).json({
      success: true,
      message: "Invoice updated",
      data: invoice,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// CANCEL INVOICE
// ========================
export const cancelInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice)
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });

    invoice.invoiceStatus = "canceled";
    await invoice.save();

    return res.status(200).json({
      success: true,
      message: "Invoice canceled successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
