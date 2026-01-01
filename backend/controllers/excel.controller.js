import XLSX from "xlsx";
import mongoose from "mongoose";
import Product from "../models/product.model.js";

const requiredColumns = [
  "partNo",
  "partName",
  "largeGroup",
  "tariff",
  "revisedMRP",
  "CGSTCode",
  "SGSTCode",
  "IGSTCode"
];

// normalize header names like: "Part no " -> "partno"
const normalizeKey = (key) =>
  key
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "");

// map Excel column -> DB field
const columnMap = {
  partno: "partNo",
  partname: "partName",
  largegroup: "largeGroup",
  tariffcode: "tariff",
  tariff: "tariff",
  revisedmrp: "revisedMRP",
  currentmrp: "revisedMRP",   // fallback
  cgstcode: "CGSTCode",
  sgstcode: "SGSTCode",
  igstcode: "IGSTCode",
};

export const importExcel = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // 👇 TELL XLSX THAT HEADERS START FROM ROW-2
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const raw = XLSX.utils.sheet_to_json(sheet, {
      range: 1,   // <-- row index starts at 0 so 1 == Row-2
      defval: ""  // avoid undefined
    });

    if (!raw.length) {
      return res.status(400).json({ success: false, message: "Excel file is empty" });
    }

    // 👇 CLEAN + MAP ONLY NEEDED COLUMNS
    const data = raw.map(row => {
      const cleaned = {};

      Object.keys(row).forEach(key => {
        const normalized = normalizeKey(key);

        if (columnMap[normalized]) {
          cleaned[columnMap[normalized]] = row[key];
        }
      });

      return cleaned;
    });

    // 👇 VALIDATE THAT ALL REQUIRED FIELDS EXIST (USING ALL ROWS)
    const allKeys = new Set();
    data.forEach(r => Object.keys(r).forEach(k => allKeys.add(k)));

    const missing = requiredColumns.filter(c => !allKeys.has(c));

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields in Excel: ${missing.join(", ")}`
      });
    }

    // 👇 CONVERT NUMBERS
    data.forEach(item => {
      if (item.tariff) item.tariff = Number(item.tariff);
      if (item.revisedMRP) item.revisedMRP = Number(item.revisedMRP);
      if (item.CGSTCode) item.CGSTCode = Number(item.CGSTCode);
      if (item.SGSTCode) item.SGSTCode = Number(item.SGSTCode);
      if (item.IGSTCode) item.IGSTCode = Number(item.IGSTCode);
    });

    // 👇 CLEAR OLD DATA
    await Product.deleteMany({}, { session });

    // 👇 INSERT NEW DATA
    await Product.insertMany(data, { session });

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      message: `Successfully replaced all data with ${data.length} record(s)`,
      rows: data.length,
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Import error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
