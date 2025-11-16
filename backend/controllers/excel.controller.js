import XLSX from 'xlsx';

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

export const importExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: "Excel file is empty" });
    }

    const excelColumns = Object.keys(data[0]);
    const missing = requiredColumns.filter(col => !excelColumns.includes(col));

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required columns: ${missing.join(", ")}`
      });
    }

    return res.json({
      success: true,
      message: `Successfully imported ${data.length} record(s)`,
      rows: data.length,
      data
    });

  } catch (err) {
    console.error("Import error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
