import Invoice from "../models/invoice.model.js";
import { calculateTotals } from "../utils/calculateTotals.js";
import { generateInvoiceNumber } from "../utils/generateInvoiceNumber.js";
// Create invoice
export const createInvoice = async (req, res) => {
  try {
    const data = req.body;
    if (data.invoiceType !== "quotation") {
      data.invoiceNumber = await generateInvoiceNumber(data.invoiceType);
    }
    calculateTotals(data);
    const invoice = await Invoice.create(data);
    return res
      .status(201)
      .json({ success: true, message: "Invoice created Successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// filter Invoice

export const getInvoices = async (req, res) => {
    try {
        const filters = {};
        if (req.query.invoiceType) filters.invoiceType = req.query.invoiceType;
        if (req.query.invoiceStatus) filters.invoiceStatus = req.query.invoiceStatus;
        if(req.query.phone) filters['customer.phone'] = req.query.phone;
        if (req.query.invoiceNumber) filters.invoiceNumber = req.query.invoiceNumber;
        const invoices = (await Invoice.find(filters)).toSorted({createdAt : -1});
        return res.status(200).json({ success: true, data : invoices });
    } catch (error) {
        
    }
}

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice)
      return res.status(404).json({ success: false, message: "Invoice not found" });

    res.json({ success: true, data: invoice });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice)
      return res.status(404).json({ success: false, message: "Invoice not found" });

    if (invoice.invoiceStatus === "canceled")
      return res.status(400).json({ message: "Canceled invoice cannot be edited" });

    const updates = req.body;

    // Invoice number cannot be changed
    if (updates.invoiceNumber && updates.invoiceNumber !== invoice.invoiceNumber) {
      return res.status(400).json({ message: "Invoice number cannot be modified" });
    }

    // Merge updates
    Object.assign(invoice, updates);

    // Recalculate totals if items updated
    if (updates.items) calculateTotals(invoice);

    await invoice.save();

    res.json({ success: true, message: "Invoice updated", data: invoice });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice)
      return res.status(404).json({ message: "Invoice not found" });

    invoice.invoiceStatus = "canceled";
    await invoice.save();

    res.json({ success: true, message: "Invoice canceled successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
