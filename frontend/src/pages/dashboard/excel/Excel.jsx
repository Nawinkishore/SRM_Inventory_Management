import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

const Excel = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRequirements, setShowRequirements] = useState(true);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an Excel file first");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      // Using fetch API - replace with your actual backend URL
      const response = await fetch('http://localhost:5000/api/excel/import', {
        method: 'PUT',
        body: formData,
        // Don't set Content-Type header - browser sets it with boundary automatically
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Upload successful");
        setFile(null); // Clear the file after successful upload
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const requiredColumns = [
    { excel: "part no", field: "partNo" },
    { excel: "part name", field: "partName" },
    { excel: "large Group", field: "largeGroup" },
    { excel: "tariffcode or Tariff", field: "tariff" },
    { excel: "Revised MRP or Current MRP", field: "revisedMRP" },
    { excel: "CGST Code", field: "CGSTCode" },
    { excel: "SGST Code", field: "SGSTCode" },
    { excel: "IGST Code", field: "IGSTCode" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
      {/* Upload Card */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Import Product Data
            </h2>
            <p className="text-sm text-gray-600">
              Upload Excel file to replace all existing products
            </p>
          </div>
        </div>

        {/* File Input Section */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-blue-400 transition-colors">
            <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-400" />
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium">
                Click to browse
              </span>
              <span className="text-sm sm:text-base text-gray-600">
                {" "}
                or drag and drop
              </span>
            </label>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Excel files only (.xlsx, .xls)
            </p>
            {file && (
              <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-md">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 truncate max-w-[200px] sm:max-w-none">
                  {file.name}
                </span>
                <button
                  onClick={() => setFile(null)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={loading || !file}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Uploading..." : "Upload & Replace All Products"}
          </Button>
        </div>
      </Card>

      {/* Requirements Card */}
      <Card className="p-4 sm:p-6">
        <button
          onClick={() => setShowRequirements(!showRequirements)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Excel Import Requirements
          </h3>
          {showRequirements ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {showRequirements && (
          <div className="mt-4 space-y-6">
            {/* Quick Instructions */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium text-sm sm:text-base">
                    Quick Checklist:
                  </p>
                  <ul className="text-xs sm:text-sm space-y-1 ml-4 list-disc">
                    <li>
                      Headers must be on <strong>Row-2</strong>
                    </li>
                    <li>
                      Upload <strong>.xlsx or .xls</strong> files only
                    </li>
                    <li>All 8 required columns must be present</li>
                    <li>
                      This will <strong>replace all existing data</strong>
                    </li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            {/* Header Row Requirement */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  1
                </span>
                Header Row Structure
              </h4>
              <div className="ml-8 text-xs sm:text-sm text-gray-700 space-y-2">
                <p>
                  <strong>VERY IMPORTANT:</strong> Column headers must be on{" "}
                  <strong>Row-2</strong>
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-xs">
                    <tbody>
                      <tr className="border-b bg-gray-50">
                        <td className="border-r px-2 py-1 font-medium">
                          Row 1
                        </td>
                        <td className="px-2 py-1">
                          Can be empty / title / formatting (ignored)
                        </td>
                      </tr>
                      <tr className="border-b bg-blue-50">
                        <td className="border-r px-2 py-1 font-bold">Row 2</td>
                        <td className="px-2 py-1 font-bold">
                          Column headers (REQUIRED)
                        </td>
                      </tr>
                      <tr>
                        <td className="border-r px-2 py-1 font-medium">
                          Row 3+
                        </td>
                        <td className="px-2 py-1">Data rows</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Required Columns */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  2
                </span>
                Required Columns (8 columns)
              </h4>
              <div className="ml-8 overflow-x-auto">
                <table className="min-w-full border text-xs sm:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border px-2 py-2 text-left font-medium">
                        Excel Header
                      </th>
                      <th className="border px-2 py-2 text-left font-medium">
                        Internal Field
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {requiredColumns.map((col, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="border px-2 py-2">
                          <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                            {col.excel}
                          </code>
                        </td>
                        <td className="border px-2 py-2 text-gray-600">
                          {col.field}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Data Format Rules */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  3
                </span>
                Data Format Rules
              </h4>
              <div className="ml-8 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium mb-1">Text Fields:</p>
                    <ul className="space-y-1 text-gray-700">
                      <li>• part no: Text/Alphanumeric</li>
                      <li>• part name: Text</li>
                      <li>• large Group: Text</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium mb-1">Number Fields:</p>
                    <ul className="space-y-1 text-gray-700">
                      <li>• tariff: Number</li>
                      <li>• revisedMRP: Number (no commas)</li>
                      <li>• CGST/SGST/IGST: Number</li>
                    </ul>
                  </div>
                </div>
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-xs sm:text-sm">
                    <strong>❌ Don't:</strong> Include commas in numbers
                    (263,679) or leave mandatory fields empty
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            {/* Common Mistakes */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  !
                </span>
                Common Mistakes
              </h4>
              <div className="ml-8 overflow-x-auto">
                <table className="min-w-full border text-xs sm:text-sm">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="border px-2 py-2 text-left font-medium">
                        Mistake
                      </th>
                      <th className="border px-2 py-2 text-left font-medium">
                        Result
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="border px-2 py-2">Headers in Row-1</td>
                      <td className="border px-2 py-2 text-red-600">
                        Cannot detect fields
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="border px-2 py-2">Misspelled header</td>
                      <td className="border px-2 py-2 text-red-600">
                        Validation fails
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="border px-2 py-2">
                        Missing required column
                      </td>
                      <td className="border px-2 py-2 text-red-600">
                        Upload rejected
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="border px-2 py-2">Numbers with commas</td>
                      <td className="border px-2 py-2 text-red-600">
                        Incorrect values
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Warning */}
            <Alert className="bg-yellow-50 border-yellow-300">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <AlertDescription className="text-xs sm:text-sm">
                <strong>⚠️ Important:</strong> Uploading a file will{" "}
                <strong>delete all existing product data</strong> and replace it
                with the uploaded data. Please ensure your file is correct
                before uploading.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Excel;