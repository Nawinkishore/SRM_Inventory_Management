import { createQuotation ,getQuotationById,getQuotations,updateQuotationById,deleteQuotationById } from "../controllers/quotation.controller.js";
import express from "express";

const router = express.Router();
router.post("/", createQuotation);
router.get("/", getQuotations);
router.get("/:id", getQuotationById);
router.patch("/:id", updateQuotationById);
router.delete("/:id", deleteQuotationById);


export default router;