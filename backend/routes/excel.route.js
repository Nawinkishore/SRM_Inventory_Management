import express from "express";
import multer from "multer";
import { importExcel } from "../controllers/excel.controller.js";

const router = express.Router();

// Multer setup for file upload
const upload = multer({ dest: "uploads/" });

// Route → POST /api/excel/import
router.put("/import", upload.single("file"), importExcel);

export default router;
