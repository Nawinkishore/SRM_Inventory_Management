import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  cancelInvoice,
} from "../controllers/invoice.controller.js";

const router = express.Router();

// Create new invoice
router.post("/invoices", createInvoice);

// Get all invoices (with optional filters)
router.get("/invoices", getInvoices);

// Get single invoice by ID
router.get("/invoices/:id", getInvoiceById);

// Update invoice
router.put("/invoices/:id", updateInvoice);

// Cancel invoice (soft delete)
router.patch("/invoices/:id/cancel", cancelInvoice);

export default router;
