// src/utils/invoiceTemplate.js

export const generateInvoiceHTML = ({
  OWNER_ADDRESS,
  logoDataUrl,
  qrDataUrl,
  customerInfo,
  invoiceNumber,
  invoiceDate,
  formatDate,
  numberToWords,
  items,
  subtotal,
  totalTax,
  grandTotal,
  nextServiceDate,
  nextServiceKms,
}) => {
  return `
    <div class="invoice-container">
      <div class="header">
        <div class="company-info">
          <div class="company-name">${OWNER_ADDRESS.name}</div>
          <div class="company-details">
            ${OWNER_ADDRESS.addressLines.map((line) => `<div>${line}</div>`).join("")}
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
          ${customerInfo.phone ? `<div>Contact No.: ${customerInfo.phone}</div>` : ""}
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
              <td class="text-right">₹ ${parseInt(item.mrp).toFixed(2)}</td>
              <td class="text-center">${(parseInt(item.cgst) + parseInt(item.sgst)).toFixed(1)}%</td>
              <td class="text-right">₹ ${(item.amount + item.taxAmount).toFixed(2)}</td>
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
            <span>SGST@${(items[0]?.sgst || 0).toFixed(1)}%</span>
            <span>₹${(totalTax() / 2).toFixed(2)}</span>
          </div>
          <div class="amount-row">
            <span>CGST@${(items[0]?.cgst || 0).toFixed(1)}%</span>
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
};
