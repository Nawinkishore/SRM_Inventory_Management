// src/components/InvoiceTemplate.jsx
import React, { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function InvoiceTemplate({
  invoice,
  owner,
  logoSrc,
  qrSrc,
  onClose,
  autoDownload = false,
}) {
  const printRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const subtotal = () => (invoice?.items || []).reduce((s, it) => s + (it.amount || 0), 0);
  const totalTax = () => (invoice?.items || []).reduce((s, it) => s + (it.taxAmount || 0), 0);
  const grandTotal = () => subtotal() + totalTax();

  const numberToWords = (n) => {
    if (!n && n !== 0) return "";
    const ones = ["Zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
    const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
    
    const words = (x) => {
      if (x < 20) return ones[x];
      if (x < 100) return tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : "");
      if (x < 1000) return ones[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " and " + words(x % 100) : "");
      if (x < 100000) return words(Math.floor(x / 1000)) + " Thousand" + (x % 1000 ? " " + words(x % 1000) : "");
      if (x < 10000000) return words(Math.floor(x / 100000)) + " Lakh" + (x % 100000 ? " " + words(x % 100000) : "");
      return x.toString();
    };
    
    return words(Math.floor(n)) + " Rupees only";
  };

  const printInvoice = () => {
    if (!printRef.current) {
      alert("Invoice content not ready");
      return;
    }

    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    
    if (!printWindow) {
      alert("Please allow pop-ups to print invoices");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${invoice?.invoiceNumber || ""}</title>
          <style>
            @page { size: A4; margin: 10mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #000; background: #fff; padding: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            img { max-width: 100%; height: auto; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 250);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const exportToPdf = async () => {
    if (!printRef.current) {
      alert("Invoice content not ready");
      return;
    }

    setExporting(true);

    try {
      const images = printRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
            setTimeout(resolve, 2000);
          });
        })
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      const element = printRef.current;
      
      // Create wrapper with complete style reset
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'all: initial; position: absolute; left: -9999px; top: 0; font-family: Arial, sans-serif;';
      
      const cloned = element.cloneNode(true);
      // Strip all classes from cloned element and children
      cloned.removeAttribute('class');
      cloned.querySelectorAll('*').forEach(el => el.removeAttribute('class'));
      
      wrapper.appendChild(cloned);
      document.body.appendChild(wrapper);

      const canvas = await html2canvas(cloned, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 0,
        width: cloned.offsetWidth,
        height: cloned.offsetHeight,
      });

      document.body.removeChild(wrapper);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      const imgData = canvas.toDataURL("image/png", 1.0);

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }

      const fileName = `Invoice-${invoice?.invoiceNumber || "document"}.pdf`;
      pdf.save(fileName);

    } catch (err) {
      console.error("PDF export error:", err);
      alert("Failed to export PDF: " + (err.message || "Unknown error") + "\n\nPlease try the Print option instead.");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (autoDownload && isReady && invoice) {
      const timer = setTimeout(async () => {
        try {
          await exportToPdf();
          if (onClose) {
            setTimeout(() => onClose(), 800);
          }
        } catch (err) {
          console.error("Auto-download failed:", err);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [autoDownload, isReady, invoice]);

  if (!invoice) return null;

  return (
    <div style={{ all: 'initial', fontFamily: 'Arial, sans-serif' }}>
      {/* Invoice Content - Completely isolated from Tailwind */}
      <div 
        ref={printRef}
        style={{
          all: 'initial',
          display: 'block',
          fontFamily: 'Arial, sans-serif',
          background: '#ffffff',
          padding: '20px',
          width: '210mm',
          minHeight: '297mm',
          margin: '0 auto',
          boxSizing: 'border-box',
          color: '#000000',
          fontSize: '12px',
          lineHeight: '1.4'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', borderBottom: '2px solid #000000', paddingBottom: '10px' }}>
          <div style={{ flex: '1' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#000000' }}>
              {owner?.name}
            </div>
            <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#000000' }}>
              {owner?.addressLines?.map((line, i) => (
                <div key={i} style={{ color: '#000000' }}>{line}</div>
              ))}
              <div style={{ marginTop: '4px', color: '#000000' }}>Phone: {owner?.phone}</div>
              <div style={{ color: '#000000' }}>Email: {owner?.email}</div>
              <div style={{ color: '#000000' }}>GSTIN: {owner?.gst}</div>
              <div style={{ color: '#000000' }}>{owner?.stateInfo}</div>
            </div>
          </div>

          <div style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #cccccc', flexShrink: '0' }}>
            {logoSrc ? (
              <img 
                src={logoSrc} 
                alt="Logo" 
                style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain', display: 'block' }}
              />
            ) : (
              <div style={{ fontWeight: '700', color: '#999999' }}>LOGO</div>
            )}
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '18px', marginBottom: '15px', textTransform: 'uppercase', color: '#000000' }}>
          TAX INVOICE
        </div>

        {/* Bill To & Invoice Details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', gap: '30px' }}>
          <div style={{ flex: '1' }}>
            <div style={{ fontWeight: '700', marginBottom: '8px', fontSize: '13px', color: '#000000' }}>Bill To:</div>
            <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px', color: '#000000' }}>
              {invoice.customerName || "—"}
            </div>
            {invoice.contactNumber && (
              <div style={{ fontSize: '12px', color: '#000000' }}>Contact: {invoice.contactNumber}</div>
            )}
          </div>
          
          <div style={{ width: '45%', fontSize: '12px', color: '#000000' }}>
            <div style={{ fontWeight: '700', marginBottom: '8px', fontSize: '13px', color: '#000000' }}>Invoice Details:</div>
            <div style={{ marginBottom: '4px', color: '#000000' }}>
              <strong style={{ color: '#000000' }}>Invoice No:</strong> {invoice.invoiceNumber}
            </div>
            <div style={{ color: '#000000' }}>
              <strong style={{ color: '#000000' }}>Date:</strong> {formatDate(invoice.invoiceDate)}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '15px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000000', padding: '10px 8px', width: '40px', textAlign: 'center', backgroundColor: '#f0f0f0', fontWeight: '700', color: '#000000' }}>#</th>
              <th style={{ border: '1px solid #000000', padding: '10px 8px', backgroundColor: '#f0f0f0', fontWeight: '700', color: '#000000', textAlign: 'left' }}>Item Name</th>
              <th style={{ border: '1px solid #000000', padding: '10px 8px', width: '80px', backgroundColor: '#f0f0f0', fontWeight: '700', color: '#000000', textAlign: 'left' }}>Code</th>
              <th style={{ border: '1px solid #000000', padding: '10px 8px', width: '80px', backgroundColor: '#f0f0f0', fontWeight: '700', color: '#000000', textAlign: 'left' }}>HSN/SAC</th>
              <th style={{ border: '1px solid #000000', padding: '10px 8px', width: '90px', textAlign: 'right', backgroundColor: '#f0f0f0', fontWeight: '700', color: '#000000' }}>Price/Unit</th>
              <th style={{ border: '1px solid #000000', padding: '10px 8px', width: '60px', textAlign: 'center', backgroundColor: '#f0f0f0', fontWeight: '700', color: '#000000' }}>GST%</th>
              <th style={{ border: '1px solid #000000', padding: '10px 8px', width: '100px', textAlign: 'right', backgroundColor: '#f0f0f0', fontWeight: '700', color: '#000000' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).map((item, idx) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #000000', padding: '8px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                <td style={{ border: '1px solid #000000', padding: '8px', fontWeight: '600', color: '#000000' }}>{item.description}</td>
                <td style={{ border: '1px solid #000000', padding: '8px', color: '#000000' }}>{item.partNo || "—"}</td>
                <td style={{ border: '1px solid #000000', padding: '8px', color: '#000000' }}>{item.hsn || "—"}</td>
                <td style={{ border: '1px solid #000000', padding: '8px', textAlign: 'right', color: '#000000' }}>₹{(item.mrp || 0).toFixed(2)}</td>
                <td style={{ border: '1px solid #000000', padding: '8px', textAlign: 'center', color: '#000000' }}>
                  {((item.cgst || 0) + (item.sgst || 0)).toFixed(1)}%
                </td>
                <td style={{ border: '1px solid #000000', padding: '8px', textAlign: 'right', fontWeight: '600', color: '#000000' }}>
                  ₹{((item.amount || 0) + (item.taxAmount || 0)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', gap: '30px' }}>
          <div style={{ flex: '1' }}>
            <div style={{ fontWeight: '700', marginBottom: '8px', fontSize: '13px', color: '#000000' }}>Amount in Words:</div>
            <div style={{ fontSize: '12px', fontStyle: 'italic', lineHeight: '1.5', color: '#000000' }}>
              {numberToWords(grandTotal())}
            </div>
          </div>
          
          <div style={{ width: '45%', fontSize: '12px', color: '#000000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #cccccc' }}>
              <span style={{ color: '#000000' }}>Sub Total:</span>
              <span style={{ fontWeight: '600', color: '#000000' }}>₹{subtotal().toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #cccccc' }}>
              <span style={{ color: '#000000' }}>Total Tax:</span>
              <span style={{ fontWeight: '600', color: '#000000' }}>₹{totalTax().toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: '700', fontSize: '15px', borderTop: '2px solid #000000', marginTop: '6px' }}>
              <span style={{ color: '#000000' }}>Grand Total:</span>
              <span style={{ color: '#000000' }}>₹{grandTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '25px', paddingTop: '15px', borderTop: '1px solid #cccccc' }}>
          <div style={{ fontSize: '11px', color: '#000000' }}>
            <div style={{ marginBottom: '4px', color: '#000000' }}>
              <strong style={{ color: '#000000' }}>Next Service Date:</strong>{" "}
              {invoice.nextServiceDate ? formatDate(invoice.nextServiceDate) : "—"}
            </div>
            <div style={{ color: '#000000' }}>
              <strong style={{ color: '#000000' }}>Next Service Kms:</strong> {invoice.nextServiceKms || "—"}
            </div>
          </div>
          
          <div style={{ width: '80px', height: '80px', flexShrink: '0' }}>
            {qrSrc && (
              <img 
                src={qrSrc} 
                alt="QR" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
        <button
          onClick={exportToPdf}
          disabled={exporting}
          style={{
            padding: '12px 24px',
            background: exporting ? '#94a3b8' : '#3b82f6',
            color: '#ffffff',
            borderRadius: '6px',
            border: 'none',
            cursor: exporting ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          {exporting ? "Generating PDF..." : "Download PDF"}
        </button>

        <button 
          onClick={printInvoice}
          disabled={exporting}
          style={{
            padding: '12px 24px',
            background: '#ffffff',
            color: '#374151',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            cursor: exporting ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          Print Invoice
        </button>

        {onClose && (
          <button 
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: '#ffffff',
              color: '#6b7280',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              marginLeft: 'auto',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}