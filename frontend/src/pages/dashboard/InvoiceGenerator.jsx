import React, { useState, useEffect } from "react";
import { Trash2, Download, Search, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, clearProducts } from "@/store/product/productSlice";
import { toast } from "sonner";
import logoImg from "@/assets/logo.jpg";
import qrImg from "@/assets/qrcode.png";

import { useInvoiceCreate } from "@/features/invoice/useInvoiceCreate";

const OWNER_ADDRESS = {
  name: "SRM MOTORS",
  addressLines: [
    "2/89C,Anna Nagar,",
    "Jayamkondam Main road,",
    "Sendurai Po & Tk",
    "Ariyalur DT",
  ],
  phone: "7825914040",
  email: "srmmotorssendurai@gmail.com",
  gst: "33BWLPM0667D1ZM",
  stateInfo: "State: 33-Tamil Nadu",
};

const InvoiceGenerator = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const productState = useSelector(
    (s) => s.products || { items: [], loading: false, error: null }
  );
  const filteredPartsRedux = productState.items || [];
  const loading = productState.loading || false;

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "" });
  const [items, setItems] = useState([]);
  const [searchPartNo, setSearchPartNo] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [nextServiceDate, setNextServiceDate] = useState("");
  const [nextServiceKms, setNextServiceKms] = useState("");

  const [logoDataUrl, setLogoDataUrl] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  const { mutate: createInvoice } = useInvoiceCreate();

  useEffect(() => {
    const d = new Date();
    const rand = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    setInvoiceNumber(rand);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const q = searchPartNo.trim();
      if (q) dispatch(fetchProducts(q));
      else {
        dispatch(clearProducts());
        setShowDropdown(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [searchPartNo, dispatch]);

  useEffect(
    () =>
      setShowDropdown(Boolean(filteredPartsRedux && filteredPartsRedux.length)),
    [filteredPartsRedux]
  );

  const blobToDataUrl = (blob) =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onloadend = () => res(reader.result);
      reader.onerror = rej;
      reader.readAsDataURL(blob);
    });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (logoImg) {
          const r = await fetch(logoImg);
          if (!mounted) return;
          const b = await r.blob();
          const d = await blobToDataUrl(b);
          if (mounted) setLogoDataUrl(d);
        }
        if (qrImg) {
          const r2 = await fetch(qrImg);
          if (!mounted) return;
          const b2 = await r2.blob();
          const d2 = await blobToDataUrl(b2);
          if (mounted) setQrDataUrl(d2);
        }
      } catch (e) {
        console.warn("Base64 convert failed:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const calcTaxFor = (mrp, qty, cgst, sgst) =>
    (mrp * qty * (cgst + sgst)) / 100;
  const subtotal = () => items.reduce((s, it) => s + it.amount, 0);
  const totalTax = () => items.reduce((s, it) => s + it.taxAmount, 0);
  const grandTotal = () => subtotal() + totalTax();

  const addPart = (part = null) => {
    if (!part) {
      if (!filteredPartsRedux.length) return alert("No product found!");
      part = filteredPartsRedux[0];
    }
    const newItem = {
      id: Date.now(),
      partNo: part.partNo,
      description: part.description,
      mrp: part.mrp || 0,
      quantity: 1,
      cgst: part.cgst || 0,
      sgst: part.sgst || 0,
      amount: part.mrp || 0,
      taxAmount: calcTaxFor(part.mrp || 0, 1, part.cgst || 0, part.sgst || 0),
      hsn: part.hsn || "87141090",
    };
    setItems((p) => [...p, newItem]);
    setSearchPartNo("");
    setShowDropdown(false);
    dispatch(clearProducts());
  };

  const changeQty = (id, val) => {
    setItems(
      items.map((it) =>
        it.id === id
          ? {
              ...it,
              quantity: Number(val) || 1,
              amount: it.mrp * (Number(val) || 1),
              taxAmount: calcTaxFor(it.mrp, Number(val) || 1, it.cgst, it.sgst),
            }
          : it
      )
    );
  };

  const removeItem = (id) => setItems(items.filter((i) => i.id !== id));

  const resetForm = () => {
    setCustomerInfo({ name: "", phone: "" });
    setItems([]);
    setSearchPartNo("");
    setInvoiceDate(new Date().toISOString().split("T")[0]);
    setNextServiceDate("");
    setNextServiceKms("");
    const d = new Date();
    const rand = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    setInvoiceNumber(rand);
  };

  const numberToWords = (n) => {
    if (!n && n !== 0) return "";
    const ones = [
      "Zero",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const words = (x) => {
      if (x < 20) return ones[x];
      if (x < 100)
        return tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : "");
      if (x < 1000)
        return (
          ones[Math.floor(x / 100)] +
          " Hundred" +
          (x % 100 ? " and " + words(x % 100) : "")
        );
      if (x < 100000)
        return (
          words(Math.floor(x / 1000)) +
          " Thousand" +
          (x % 1000 ? " " + words(x % 1000) : "")
        );
      if (x < 10000000)
        return (
          words(Math.floor(x / 100000)) +
          " Lakh" +
          (x % 100000 ? " " + words(x % 100000) : "")
        );
      return x.toString();
    };
    return words(Math.floor(n)) + " Rupees only";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const saveInvoiceToDB = () => {
    const payload = {
      UserId: user._id,
      invoiceNumber,
      invoiceDate,
      customerName: customerInfo.name,
      contactNumber: customerInfo.phone,
      items: items.map((item) => ({
        partNo: item.partNo,
        description: item.description,
        quantity: item.quantity,
        mrp: item.mrp,
        cgst: item.cgst,
        sgst: item.sgst,
        hsn: item.hsn,
        amount: item.amount,
        taxAmount: item.taxAmount,
        total: item.amount + item.taxAmount,
      })),
      nextServiceDate,
      nextServiceKms,
      subtotal: subtotal(),
      totalTax: totalTax(),
      grandTotal: grandTotal(),
    };

    createInvoice(payload, {
      onSuccess: () => toast.success("Invoice saved successfully!"),
      onError: (err) => toast.error("Failed to save invoice: " + err.message),
    });
  };
  const downloadPDF = () => {
    if (!customerInfo.name || items.length === 0) {
      return alert("Add customer name and at least one item!");
    }
    saveInvoiceToDB();
    const printWindow = window.open("", "", "width=600,height=842");

    const invoiceHTML = `
      <div class="invoice-container">
        <div class="header">
          <div class="company-info">
            <div class="company-name">${OWNER_ADDRESS.name}</div>
            <div class="company-details">
              ${OWNER_ADDRESS.addressLines
                .map((line) => `<div>${line}</div>`)
                .join("")}
              <div>Phone no.: ${OWNER_ADDRESS.phone}</div>
              <div>Email: ${OWNER_ADDRESS.email}</div>
              <div>GSTIN: ${OWNER_ADDRESS.gst}</div>
              <div>${OWNER_ADDRESS.stateInfo}</div>
            </div>
          </div>
          <div class="logo-area">
            ${
              logoDataUrl
                ? `<img src="${logoDataUrl}" alt="Logo" />`
                : "<div>LOGO</div>"
            }
          </div>
        </div>

        <div class="tax-invoice">Tax Invoice</div>

        <div class="bill-section">
          <div class="bill-to">
            <div class="bill-to-title">Bill To</div>
            <div class="customer-name">${customerInfo.name || "—"}</div>
            ${
              customerInfo.phone
                ? `<div>Contact No.: ${customerInfo.phone}</div>`
                : ""
            }
          </div>
          <div class="invoice-details">
            <div class="invoice-details-title">Invoice Details</div>
            <div>Invoice No.: <strong>${invoiceNumber}</strong></div>
            <div>Date: <strong>${formatDate(invoiceDate)}</strong></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="col-no text-center">#</th>
              <th class="col-item">Item Name</th>
              <th class="col-code">Item Code</th>
              <th class="col-hsn">HSN/ SAC</th>
              <th class="col-price text-right">Price/ Unit</th>
              <th class="col-gst text-center">GST</th>
              <th class="col-amount text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td style="font-weight: bold">${item.description}</td>
                <td>${item.partNo}</td>
                <td>${item.hsn}</td>
                <td class="text-right">₹ ${item.mrp.toFixed(2)}</td>
                <td class="text-center">${(item.cgst + item.sgst).toFixed(
                  1
                )}%</td>
                <td class="text-right">₹ ${(
                  item.amount + item.taxAmount
                ).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer-section">
          <div style="width: 48%">
            <div class="words-section">
              <div class="words-title">Invoice Amount In Words</div>
              <div>${numberToWords(grandTotal())}</div>
            </div>
          </div>
          <div class="amounts-box">
            <div class="amount-row">
              <span>Sub Total</span>
              <span>₹${subtotal().toFixed(2)}</span>
            </div>
            <div class="amount-row">
              <span>SGST@${
                items.length && items[0].sgst ? items[0].sgst.toFixed(1) : "0"
              }%</span>
              <span>₹${(totalTax() / 2).toFixed(2)}</span>
            </div>
            <div class="amount-row">
              <span>CGST@${
                items.length && items[0].cgst ? items[0].cgst.toFixed(1) : "0"
              }%</span>
              <span>₹${(totalTax() / 2).toFixed(2)}</span>
            </div>
            <div class="amount-row total-row">
              <span>Total</span>
              <span>₹${grandTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div class="bottom-section">
          <div class="service-info">
            <div>Next Service Date: ${
              nextServiceDate ? formatDate(nextServiceDate) : "--"
            }</div>
            <div>Next Service Kms: ${nextServiceKms || "--"}</div>
          </div>
          <div class="qr-section">
            ${
              qrDataUrl
                ? `<img src="${qrDataUrl}" alt="QR Code" class="qr-code" />`
                : ""
            }
          </div>
        </div>
      </div>
    `;

    const printCss = `
      <style>
        @page { size: A5 portrait; margin: 8mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          font-size: 9px;
          line-height: 1.2;
          color: #000;
        }
        .invoice-container { width: 100%; }
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start;
          margin-bottom: 6px;
          padding-bottom: 6px;
          border-bottom: 1px solid #000;
        }
        .company-info { flex: 1; }
        .company-name { 
          font-size: 16px; 
          font-weight: bold; 
          margin-bottom: 2px;
        }
        .company-details { 
          font-size: 8.5px; 
          line-height: 1.3;
        }
        .logo-area { 
          width: 70px; 
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-area img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .tax-invoice { 
          text-align: center; 
          font-weight: bold;
          font-size: 11px;
          margin: 6px 0;
        }
        .bill-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .bill-to {
          flex: 1;
          font-size: 9px;
        }
        .bill-to-title {
          font-weight: bold;
          margin-bottom: 3px;
        }
        .customer-name {
          font-weight: bold;
          margin-bottom: 2px;
        }
        .invoice-details {
          width: 45%;
          text-align: right;
          font-size: 9px;
        }
        .invoice-details-title {
          font-weight: bold;
          margin-bottom: 3px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          font-size: 8.5px;
          margin-bottom: 8px;
        }
        th, td { 
          border: 1px solid #000; 
          padding: 4px 3px;
          text-align: left;
        }
        th { 
          background: #f0f0f0; 
          font-weight: bold;
          font-size: 8.5px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .col-no { width: 5%; }
        .col-item { width: 28%; }
        .col-code { width: 18%; }
        .col-hsn { width: 13%; }
        .col-price { width: 12%; }
        .col-gst { width: 10%; }
        .col-amount { width: 14%; }
        .footer-section {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
        }
        .amounts-box {
          width: 48%;
          font-size: 9px;
        }
        .amount-row {
          display: flex;
          justify-content: space-between;
          padding: 2px 0;
        }
        .total-row {
          font-weight: bold;
          border-top: 2px solid #000;
          padding-top: 4px;
          margin-top: 4px;
        }
        .bottom-section {
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .service-info {
          font-size: 9px;
          margin-bottom: 4px;
        }
        .qr-section {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .qr-code {
          width: 70px;
          height: 70px;
          object-fit: contain;
        }
        .words-section {
          margin-top: 8px;
          font-size: 9px;
        }
        .words-title {
          font-weight: bold;
          margin-bottom: 2px;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    `;

    printWindow.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>Invoice-${invoiceNumber}</title>${printCss}</head><body>${invoiceHTML}<script>window.onload = function(){ window.print(); setTimeout(()=>window.close(),200); };</script></body></html>`
    );
    printWindow.document.close();

    setTimeout(() => {
      resetForm();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Invoice Generator
          </h2>
          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md"
            >
              <X size={16} /> Reset
            </button>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <Download size={16} /> Generate Invoice
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b">
            <div>
              <label className="text-sm font-medium block mb-2">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">
                Invoice Date
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
          </div>

          <div className="mb-6 pb-6 border-b">
            <h3 className="font-semibold mb-3 text-lg">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                placeholder="Customer Name *"
                value={customerInfo.name}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, name: e.target.value })
                }
                className="w-full border border-gray-300 p-2 rounded"
              />
              <input
                placeholder="Contact Number"
                value={customerInfo.phone}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, phone: e.target.value })
                }
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
          </div>

          <div className="mb-6 pb-6 border-b">
            <h3 className="font-semibold mb-3 text-lg">Add Items</h3>
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={searchPartNo}
                onChange={(e) => setSearchPartNo(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  filteredPartsRedux.length > 0 &&
                  addPart(filteredPartsRedux[0])
                }
                placeholder="Search by part no or name"
                className="flex-1 border border-gray-300 p-2 rounded"
              />
              <button
                onClick={() => addPart()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center"
              >
                <Search size={16} className="mr-1" /> Add
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 mt-1 rounded shadow-lg z-50 max-h-60 overflow-y-auto">
                  {loading && (
                    <div className="p-3 text-sm text-gray-500">Loading...</div>
                  )}
                  {!loading && filteredPartsRedux.length === 0 && (
                    <div className="p-3 text-sm text-gray-500">No results</div>
                  )}
                  {!loading &&
                    filteredPartsRedux.map((part) => (
                      <div
                        key={part.partNo}
                        onClick={() => addPart(part)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-gray-900">
                              {part.partNo}
                            </span>
                            <span className="text-sm text-gray-600 ml-2">
                              — {part.description}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            ₹{part.mrp}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {items.length > 0 ? (
            <div className="overflow-x-auto mb-6">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left border-b">#</th>
                    <th className="p-2 text-left border-b">Item Name</th>
                    <th className="p-2 text-left border-b">Item Code</th>
                    <th className="p-2 text-left border-b">HSN/SAC</th>
                    <th className="p-2 text-center border-b">Qty</th>
                    <th className="p-2 text-right border-b">Price/Unit</th>
                    <th className="p-2 text-center border-b">GST</th>
                    <th className="p-2 text-right border-b">Amount</th>
                    <th className="p-2 border-b"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2 font-semibold">{item.description}</td>
                      <td className="p-2">{item.partNo}</td>
                      <td className="p-2">{item.hsn}</td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => changeQty(item.id, e.target.value)}
                          className="w-16 border border-gray-300 p-1 rounded text-center"
                          min="1"
                        />
                      </td>
                      <td className="p-2 text-right">₹{item.mrp.toFixed(2)}</td>
                      <td className="p-2 text-center">
                        {(item.cgst + item.sgst).toFixed(1)}%
                      </td>
                      <td className="p-2 text-right font-medium">
                        ₹{(item.amount + item.taxAmount).toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mt-4">
                <div className="w-full md:w-1/3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      ₹{subtotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Tax:</span>
                    <span className="font-medium">
                      ₹{totalTax().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Grand Total:</span>
                    <span className="text-blue-600">
                      ₹{grandTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded">
              No items added yet.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t">
            <div>
              <label className="text-sm font-medium block mb-2">
                Next Service Date
              </label>
              <input
                type="date"
                value={nextServiceDate}
                onChange={(e) => setNextServiceDate(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">
                Next Service Kms
              </label>
              <input
                type="text"
                value={nextServiceKms}
                onChange={(e) => setNextServiceKms(e.target.value)}
                placeholder="e.g., 10000"
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
