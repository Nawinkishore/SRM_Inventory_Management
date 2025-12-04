import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  cancelInvoice,
  getNextInvoiceNumber,
} from "../controllers/invoice.controller.js";

const router = express.Router();

// Get next invoice number
router.get("/next-number", getNextInvoiceNumber);

// Create invoice
router.post("/", createInvoice);

// Get all invoices
router.get("/", getInvoices);

// Get one invoice
router.get("/:id", getInvoiceById);

// Update invoice
router.put("/:id", updateInvoice);

// Cancel invoice (soft delete)
router.patch("/:id/cancel", cancelInvoice);

export default router;
