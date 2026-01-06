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
  "IGSTCode",
];

// normalize header like "Part no " -> "partno"
const normalizeKey = (key) =>
  key
    ?.toString()
    ?.trim()
    ?.toLowerCase()
    ?.replace(/\s+/g, "")
    ?.replace(/_/g, "");

// map Excel column -> DB field
const columnMap = {
  partno: "partNo",
  partname: "partName",
  largegroup: "largeGroup",
  tariffcode: "tariff",
  tariff: "tariff",
  revisedmrp: "revisedMRP",
  cgstcode: "CGSTCode",
  sgstcode: "SGSTCode",
  igstcode: "IGSTCode",
};

export const importExcel = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // header = row 2
    const raw = XLSX.utils.sheet_to_json(sheet, {
      range: 1,
      defval: "",
    });

    if (!raw.length) {
      return res
        .status(400)
        .json({ success: false, message: "Excel file is empty" });
    }

    const data = raw.map((row) => {
      const doc = {};

      Object.keys(row).forEach((k) => {
        const normalized = normalizeKey(k);

        if (columnMap[normalized]) {
          doc[columnMap[normalized]] = row[k];
        }
      });

      return doc;
    });

    // ensure all required columns exist
    const allKeys = new Set();
    data.forEach((r) => Object.keys(r).forEach((k) => allKeys.add(k)));

    const missing = requiredColumns.filter((c) => !allKeys.has(c));
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing columns: ${missing.join(", ")}`,
      });
    }

    // convert & assign defaults
    data.forEach((item) => {
      item.tariff = Number(item.tariff ?? 0);
      item.revisedMRP = Number(item.revisedMRP ?? 0);
      item.CGSTCode = Number(item.CGSTCode ?? 0);
      item.SGSTCode = Number(item.SGSTCode ?? 0);
      item.IGSTCode = Number(item.IGSTCode ?? 0);

      // Pricing logic
      item.salePrice = item.revisedMRP;
      item.purchasePrice = item.revisedMRP;
      item.stock = 0;

    });
    console.log(data);
    await Product.deleteMany({}, { session });
    await Product.insertMany(data, { session });

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      message: `Imported ${data.length} products successfully`,
      rows: data.length,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return res.status(500).json({ success: false, message: "Import failed" });
  }
};
