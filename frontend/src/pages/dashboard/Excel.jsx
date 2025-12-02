import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';

const Excel = () => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  const requiredColumns = [
    { key: 'partNo', label: 'Part Number', example: '2S3137500000' },
    { key: 'partName', label: 'Part Name', example: 'THROTTLE BODY ASSY' },
    { key: 'largeGroup', label: 'Large Group', example: 'Yamaha Genuine Parts' },
    { key: 'tariff', label: 'Tariff', example: '87141090' },
    { key: 'revisedMRP', label: 'Revised MRP', example: '190182' },
    { key: 'CGSTCode', label: 'CGST Code', example: '9' },
    { key: 'SGSTCode', label: 'SGST Code', example: '9' },
    { key: 'IGSTCode', label: 'IGST Code', example: '18' }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportStatus(null);
    }
  };

  const handleImport = () => {
    if (!file) return;
    
    setImporting(true);
    // Simulate import process
    setTimeout(() => {
      setImporting(false);
      setImportStatus({ success: true, message: 'Successfully imported 1 record' });
    }, 2000);
  };

  const downloadTemplate = () => {
    // Create CSV template
    const headers = requiredColumns.map(col => col.key).join(',');
    const example = requiredColumns.map(col => col.example).join(',');
    const csv = `${headers}\n${example}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parts_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Excel Import</h1>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <div className="border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center bg-indigo-50 hover:bg-indigo-100 transition-colors">
              <input
                type="file"
                id="file-upload"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500">
                  Excel files (.xlsx, .xls) or CSV files
                </p>
              </label>
            </div>

            {file && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {importing ? 'Importing...' : 'Import Data'}
                </button>
                <button
                  onClick={() => setFile(null)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}

            {importStatus && (
              <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
                importStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {importStatus.success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{importStatus.message}</span>
              </div>
            )}
          </div>

          {/* Download Template */}
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Need a template?</h3>
                <p className="text-sm text-gray-600">Download a sample file with the correct format</p>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Template
              </button>
            </div>
          </div>

          {/* Required Columns */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Required Columns</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requiredColumns.map((col, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{col.label}</h3>
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                        {col.key}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Example: <span className="font-mono text-indigo-600">{col.example}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Instructions:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Ensure your Excel file contains all required columns</li>
              <li>• Column names must match exactly (case-sensitive)</li>
              <li>• Do not leave required fields empty</li>
              <li>• Numeric fields should not contain text characters</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    // <div>
    //   <h1 className='text-2xl'>Coming Soon! 🚧</h1>
    // </div>
  );
};

export default Excel;