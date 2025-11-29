import Invoice from "../models/saveInvoice.model.js";

// Create a new invoice
export const createInvoice = async (req, res) => {
  try {
    console.log("📥 Received invoice data:", JSON.stringify(req.body, null, 2));

    const invoice = new Invoice(req.body);
    console.log("💾 Attempting to save invoice...");

    const savedInvoice = await invoice.save();
    console.log("✅ Invoice saved successfully:", savedInvoice._id);

    res.status(201).json(savedInvoice);
  } catch (error) {
    console.error("❌ Error saving invoice:", error);
    res.status(400).json({
      error: error.message,
      details: error.errors, // Mongoose validation errors
    });
  }
};

// Get all invoices
export const getInvoices = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { invoiceNumber: { $regex: search, $options: "i" } },
          { customerName: { $regex: search, $options: "i" } },
          { contactNumber: { $regex: search, $options: "i" } },
        ],
      };
    }
    const invoices = await Invoice.find(query);
    console.log(`📋 Found ${invoices.length} invoices`);
    res.status(200).json(invoices);
  } catch (error) {
    console.error("❌ Error fetching invoices:", error);
    res.status(500).json({ error: error.message });
  }
};


// Update an invoice by ID
export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.status(200).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an invoice by ID
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
