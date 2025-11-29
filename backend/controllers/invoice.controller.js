// controllers/invoice.controller.js
import Invoice from "../models/saveInvoice.model.js";

// Get all invoices with search
export const getInvoices = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search && search.trim() !== '') {
      query = {
        $or: [
          { invoiceNumber: { $regex: search, $options: "i" } },
          { customerName: { $regex: search, $options: "i" } },
          { contactNumber: { $regex: search, $options: "i" } },
        ],
      };
    }
    
    const invoices = await Invoice.find(query).sort({ createdAt: -1 });
    console.log(`📋 Found ${invoices.length} invoices`);
    
    res.status(200).json(invoices);
  } catch (error) {
    console.error("❌ Error fetching invoices:", error);
    res.status(500).json({ 
      error: error.message || "Failed to fetch invoices" 
    });
  }
};

// Create invoice
export const createInvoice = async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    const savedInvoice = await invoice.save();
    
    console.log("✅ Invoice saved:", savedInvoice._id);
    res.status(201).json(savedInvoice);
  } catch (error) {
    console.error("❌ Error creating invoice:", error);
    res.status(400).json({
      error: error.message || "Failed to create invoice",
      details: error.errors,
    });
  }
};

// Update invoice
export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    
    res.status(200).json(invoice);
  } catch (error) {
    console.error("❌ Error updating invoice:", error);
    res.status(400).json({ 
      error: error.message || "Failed to update invoice" 
    });
  }
};

// Delete invoice
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    
    res.status(200).json({ 
      message: "Invoice deleted successfully",
      id: req.params.id 
    });
  } catch (error) {
    console.error("❌ Error deleting invoice:", error);
    res.status(500).json({ 
      error: error.message || "Failed to delete invoice" 
    });
  }
};