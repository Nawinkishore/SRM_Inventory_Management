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

// ========================
// FILTER INVOICES
// ========================
export const getInvoices = async (req, res) => {
  try {
    const filters = {};

    if (req.query.invoiceType) filters.invoiceType = req.query.invoiceType;
    if (req.query.invoiceStatus) filters.invoiceStatus = req.query.invoiceStatus;
    if (req.query.phone) filters["customer.phone"] = req.query.phone;
    if (req.query.invoiceNumber) filters.invoiceNumber = req.query.invoiceNumber;

    const invoices = await Invoice.find(filters).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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
