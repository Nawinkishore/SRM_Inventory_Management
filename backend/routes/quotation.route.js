import { createQuotation ,getQuotationById,getQuotations } from "../controllers/quotation.controller.js";
import express from "express";

const router = express.Router();
router.post("/", createQuotation);
router.get("/", getQuotations);
router.get("/:id", getQuotationById);


export default router;