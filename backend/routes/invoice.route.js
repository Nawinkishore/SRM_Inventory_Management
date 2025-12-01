// File: routes/invoice.routes.js
import express from "express";
import {
  createInvoice,
  getInvoices,
  deleteInvoice,
  getSearchedInvoice
} from "../controllers/invoice.controller.js";

const router = express.Router();

router.post("/create", createInvoice);
router.post("/getInvoices", getInvoices);
router.post('/search', getSearchedInvoice);
router.delete("/delete/:invoiceId", deleteInvoice);
export default router;
