import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getNextInvoiceNumber,
} from "../controllers/invoice.controller.js";

const router = express.Router();
router.get("/next-number", getNextInvoiceNumber);
router.post("/", createInvoice);
router.get("/", getInvoices);
router.get("/:id", getInvoiceById);
router.put("/:id", updateInvoice);
router.delete("/:id", deleteInvoice);
export default router;
