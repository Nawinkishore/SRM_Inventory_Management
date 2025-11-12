import mongoose from "mongoose";
import dotenv from "dotenv";
import xlsx from "xlsx";
import Product from "./models/Product.js";

dotenv.config();

const importExcel = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const workbook = xlsx.readFile("./products.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`📦 Total Rows: ${data.length}`);

    const formattedData = data.map((item) => {
      const cleanKeys = {};
      for (let key in item) {
        const cleanKey = key.trim();
        cleanKeys[cleanKey] = item[key];
      }

      return {
        partNo: cleanKeys["part no"] || cleanKeys["Part No"] || cleanKeys["PartNo"],
        partName: cleanKeys["part name"] || cleanKeys["Part Name"],
        largeGroup: cleanKeys["large Group"] || cleanKeys["Large Group"],
        tariff: parseInt(cleanKeys["tariff"]) || 0,
        revisedMRP: parseFloat(cleanKeys["revisedMRP"]) || 0,
        CGSTCode: parseFloat(cleanKeys["CGSTCode"]) || 0,
        SGSTCode: parseFloat(cleanKeys["SGSTCode"]) || 0,
        IGSTCode: parseFloat(cleanKeys["IGSTCode"]) || 0,
      };
    });

    await Product.insertMany(formattedData);
    console.log("🎉 Import successful!");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

importExcel();
