import React, { useState, useEffect, useRef } from "react";
import { Trash2, Download, Search, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, clearProducts } from "@/store/product/productSlice";

// -----------------------------
// Company Info
// -----------------------------
const OWNER_ADDRESS = {
  name: "SRM MOTORS",
  address: "2/89C, Anna Nagar, Sendurai",
  city: "Ariyalur",
  state: "Tamil Nadu",
  pincode: "621714",
  phone: "7825 914040 , 7825 924040",
  email: "srmmotorssendurai@gmail.com",
};

const InvoiceGenerator = () => {
  const dispatch = useDispatch();
  const productState = useSelector((state) => state.products || { items: [], loading: false, error: null });
  const filteredPartsRedux = productState.items || [];
  const loading = productState.loading || false;

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstin: "",
    phone: "",
  });
  const [items, setItems] = useState([]);
  const [searchPartNo, setSearchPartNo] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const invoiceRef = useRef();

  // Generate invoice number on mount
  useEffect(() => {
    const date = new Date();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    setInvoiceNumber(`INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}-${random}`);
  }, []);

  // Debounced search -> dispatch fetchProducts
  useEffect(() => {
    const delay = setTimeout(() => {
      const q = searchPartNo.trim();
      if (q) {
        dispatch(fetchProducts(q));
      } else {
        dispatch(clearProducts());
        setShowDropdown(false);
      }
    }, 350);

    return () => clearTimeout(delay);
  }, [searchPartNo, dispatch]);

  // Show/hide dropdown based on redux results
  useEffect(() => {
    setShowDropdown(Boolean(filteredPartsRedux && filteredPartsRedux.length));
  }, [filteredPartsRedux]);

  // Utility functions
  const calculateTaxForItem = (mrp, qty, cgst, sgst) => (mrp * qty * (cgst + sgst)) / 100;
  const calculateSubtotal = () => items.reduce((s, i) => s + i.amount, 0);
  const calculateTotalTax = () => items.reduce((s, i) => s + i.taxAmount, 0);
  const calculateGrandTotal = () => calculateSubtotal() + calculateTotalTax();

  // Add part either from passed `part` or from redux suggestions (first)
  const handleAddPart = (part = null) => {
    if (!part) {
      if (!filteredPartsRedux.length) return alert("No product found!");
      part = filteredPartsRedux[0];
    }

    // map whatever fields your API gives — we've normalized in the slice to: partNo, description, mrp, cgst, sgst
    const newItem = {
      id: Date.now(),
      partNo: part.partNo,
      description: part.description,
      mrp: part.mrp || 0,
      quantity: 1,
      cgst: part.cgst || 0,
      sgst: part.sgst || 0,
      amount: part.mrp || 0,
      taxAmount: calculateTaxForItem(part.mrp || 0, 1, part.cgst || 0, part.sgst || 0),
    };

    setItems((prev) => [...prev, newItem]);
    setSearchPartNo("");
    setShowDropdown(false);
    dispatch(clearProducts());
  };

  const handleQuantityChange = (id, val) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Number(val) || 1,
              amount: item.mrp * (Number(val) || 1),
              taxAmount: calculateTaxForItem(item.mrp, Number(val) || 1, item.cgst, item.sgst),
            }
          : item
      )
    );
  };

  const removeItem = (id) => setItems(items.filter((i) => i.id !== id));

  const resetForm = () => {
    setCustomerInfo({ name: "", address: "", city: "", state: "", pincode: "", gstin: "", phone: "" });
    setItems([]);
    setSearchPartNo("");
    setInvoiceDate(new Date().toISOString().split("T")[0]);
    setDueDate("");
    // Generate new invoice number
    const date = new Date();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    setInvoiceNumber(`INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}-${random}`);
  };

  const handleGenerateInvoice = () => {
    if (!customerInfo.name || items.length === 0) return alert("Add customer name and at least one item!");
    setShowModal(true);
  };

  // Print window approach (keeps exactly your prior behavior)
  const downloadPDF = () => {
    const content = invoiceRef.current;
    if (!content) return;

    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${invoiceNumber}</title>
          <meta charset="utf-8">
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; font-weight: 600; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .font-semibold { font-weight: 600; }
            .text-blue-600 { color: #2563eb; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-900 { color: #111827; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-700 { color: #374151; }
            .text-sm { font-size: 0.875rem; }
            .text-xs { font-size: 0.75rem; }
            .text-base { font-size: 1rem; }
            .text-lg { font-size: 1.125rem; }
            .text-2xl { font-size: 1.5rem; }
            .text-4xl { font-size: 2.25rem; }
            .mb-1 { margin-bottom: 0.25rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-6 { margin-top: 1.5rem; }
            .pb-4 { padding-bottom: 1rem; }
            .pt-2 { padding-top: 0.5rem; }
            .pt-4 { padding-top: 1rem; }
            .p-2 { padding: 0.5rem; }
            .p-3 { padding: 0.75rem; }
            .border { border: 1px solid #ddd; }
            .border-t { border-top: 1px solid #ddd; }
            .border-t-2 { border-top: 2px solid #333; }
            .border-b-2 { border-bottom: 2px solid #333; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .justify-end { justify-content: flex-end; }
            .items-start { align-items: flex-start; }
            .w-64 { width: 16rem; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          ${content.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 100);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      setShowModal(false);
      resetForm();
    }, 1500);
  };

  // -----------------------------
  // JSX UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Invoice Generator</h2>
          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md font-medium transition"
            >
              <X size={16} /> Reset
            </button>
            <button
              onClick={handleGenerateInvoice}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition"
            >
              <Download size={16} /> Generate Invoice
            </button>
          </div>
        </div>

        {/* Invoice Form */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          {/* Header Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b">
            <div>
              <label className="text-sm font-medium block mb-2">Invoice Number</label>
              <input type="text" value={invoiceNumber} readOnly className="w-full border border-gray-300 p-2 rounded bg-gray-50" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Invoice Date</label>
              <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="w-full border border-gray-300 p-2 rounded" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border border-gray-300 p-2 rounded" />
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="font-semibold mb-3 text-lg">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Customer Name *" value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} className="w-full border border-gray-300 p-2 rounded" />
              <input placeholder="Phone" value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} className="w-full border border-gray-300 p-2 rounded" />
              <input placeholder="Address" value={customerInfo.address} onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })} className="w-full border border-gray-300 p-2 rounded md:col-span-2" />
              <input placeholder="City" value={customerInfo.city} onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })} className="border border-gray-300 p-2 rounded" />
              <input placeholder="State" value={customerInfo.state} onChange={(e) => setCustomerInfo({ ...customerInfo, state: e.target.value })} className="border border-gray-300 p-2 rounded" />
              <input placeholder="Pincode" value={customerInfo.pincode} onChange={(e) => setCustomerInfo({ ...customerInfo, pincode: e.target.value })} className="border border-gray-300 p-2 rounded" />
              <input placeholder="GSTIN (Optional)" value={customerInfo.gstin} onChange={(e) => setCustomerInfo({ ...customerInfo, gstin: e.target.value })} className="border border-gray-300 p-2 rounded" />
            </div>
          </div>

          {/* Add Items */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="font-semibold mb-3 text-lg">Add Items</h3>
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={searchPartNo}
                onChange={(e) => setSearchPartNo(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && filteredPartsRedux.length > 0 && handleAddPart(filteredPartsRedux[0])}
                placeholder="Search by part no or name (e.g., P001 or Engine)"
                className="flex-1 border border-gray-300 p-2 rounded"
              />
              <button onClick={() => handleAddPart()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center">
                <Search size={16} className="mr-1" /> Add
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 mt-1 rounded shadow-lg z-50 max-h-60 overflow-y-auto">
                  {loading && <div className="p-3 text-sm text-gray-500">Loading...</div>}
                  {!loading && filteredPartsRedux.length === 0 && <div className="p-3 text-sm text-gray-500">No results</div>}
                  {!loading && filteredPartsRedux.map((part) => (
                    <div key={part.partNo} onClick={() => handleAddPart(part)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-gray-900">{part.partNo}</span>
                          <span className="text-sm text-gray-600 ml-2">— {part.description}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">₹{part.mrp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Available: fetched from server</p>
          </div>

          {/* Items Table */}
          {items.length > 0 ? (
            <div className="overflow-x-auto mb-6">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left border-b">Part No</th>
                    <th className="p-3 text-left border-b">Description</th>
                    <th className="p-3 text-center border-b">MRP</th>
                    <th className="p-3 text-center border-b">Qty</th>
                    <th className="p-3 text-center border-b">CGST%</th>
                    <th className="p-3 text-center border-b">SGST%</th>
                    <th className="p-3 text-right border-b">Amount</th>
                    <th className="p-3 border-b"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{item.partNo}</td>
                      <td className="p-3">{item.description}</td>
                      <td className="p-3 text-center">₹{item.mrp}</td>
                      <td className="p-3 text-center">
                        <input type="number" value={item.quantity} onChange={(e) => handleQuantityChange(item.id, e.target.value)} min="1" className="w-16 border border-gray-300 p-1 rounded text-center" />
                      </td>
                      <td className="p-3 text-center">{item.cgst}%</td>
                      <td className="p-3 text-center">{item.sgst}%</td>
                      <td className="p-3 text-right font-medium">₹{item.amount.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mt-4">
                <div className="w-full md:w-1/3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Tax (CGST + SGST):</span>
                    <span className="font-medium">₹{calculateTotalTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Grand Total:</span>
                    <span className="text-blue-600">₹{calculateGrandTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded">No items added yet. Search and add parts above.</div>
          )}
        </div>

        {/* PDF Preview Modal */}
        {showModal && (
          <>
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
              <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-lg shadow-2xl overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b bg-gray-50 no-print">
                  <h3 className="text-lg font-semibold">Invoice Preview</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-red-600 transition">
                    <X size={24} />
                  </button>
                </div>

                {/* Scrollable Invoice Content */}
                <div className="flex-1 overflow-y-auto p-8">
                  <div id="invoice-print" ref={invoiceRef} className="bg-white min-h-full">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start mb-6 pb-4 border-b-2">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{OWNER_ADDRESS.name}</h2>
                        <p className="text-sm text-gray-600">{OWNER_ADDRESS.address}</p>
                        <p className="text-sm text-gray-600">{OWNER_ADDRESS.city}, {OWNER_ADDRESS.state} - {OWNER_ADDRESS.pincode}</p>
                        <p className="text-sm text-gray-600">Phone: {OWNER_ADDRESS.phone}</p>
                        <p className="text-sm text-gray-600">Email: {OWNER_ADDRESS.email}</p>
                      </div>

                      <div className="text-right">
                        <h1 className="text-4xl font-bold text-blue-600 mb-2">INVOICE</h1>
                        <p className="text-sm text-gray-700">Invoice No: <strong>{invoiceNumber}</strong></p>
                        <p className="text-sm text-gray-700">Date: <strong>{invoiceDate}</strong></p>
                        <p className="text-sm text-gray-700">Due Date: <strong>{dueDate || "N/A"}</strong></p>
                      </div>
                    </div>

                    {/* Bill To */}
                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-gray-900 mb-2">Bill To:</h3>
                      <p className="text-gray-900 font-semibold">{customerInfo.name}</p>
                      <p className="text-sm text-gray-600">{customerInfo.address}</p>
                      <p className="text-sm text-gray-600">{customerInfo.city}, {customerInfo.state} - {customerInfo.pincode}</p>
                      {customerInfo.gstin && <p className="text-sm text-gray-600">GSTIN: {customerInfo.gstin}</p>}
                      {customerInfo.phone && <p className="text-sm text-gray-600">Phone: {customerInfo.phone}</p>}
                    </div>

                    {/* Items Table */}
                    <table className="w-full border border-gray-300 mb-6">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-3 text-left border text-sm">#</th>
                          <th className="p-3 text-left border text-sm">Part No</th>
                          <th className="p-3 text-left border text-sm">Description</th>
                          <th className="p-3 text-center border text-sm">Qty</th>
                          <th className="p-3 text-right border text-sm">Price</th>
                          <th className="p-3 text-center border text-sm">CGST%</th>
                          <th className="p-3 text-center border text-sm">SGST%</th>
                          <th className="p-3 text-right border text-sm">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, i) => (
                          <tr key={i} className="border">
                            <td className="p-3 border text-sm">{i + 1}</td>
                            <td className="p-3 border text-sm">{item.partNo}</td>
                            <td className="p-3 border text-sm">{item.description}</td>
                            <td className="p-3 text-center border text-sm">{item.quantity}</td>
                            <td className="p-3 text-right border text-sm">₹{item.mrp.toFixed(2)}</td>
                            <td className="p-3 text-center border text-sm">{item.cgst}%</td>
                            <td className="p-3 text-center border text-sm">{item.sgst}%</td>
                            <td className="p-3 text-right border text-sm">₹{item.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-6">
                      <div className="w-64">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Subtotal:</span>
                          <span className="text-sm font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Total Tax:</span>
                          <span className="text-sm font-medium">₹{calculateTotalTax().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t-2 pt-2">
                          <span className="font-bold">Grand Total:</span>
                          <span className="font-bold text-blue-600 text-lg">₹{calculateGrandTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center border-t pt-4 mt-6">
                      <p className="text-sm text-gray-600 mb-1">Thank you for your business!</p>
                      <p className="text-xs text-gray-500">{OWNER_ADDRESS.email} | {OWNER_ADDRESS.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 no-print">
                  <button onClick={() => setShowModal(false)} className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition">Close</button>
                  <button onClick={downloadPDF} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition">
                    <Download size={16} /> Download PDF
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceGenerator;
