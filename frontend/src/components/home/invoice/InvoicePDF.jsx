// InvoicePDF.jsx - Clean A5 Invoice with Proper Spacing

import React from "react";
import { Font } from "@react-pdf/renderer";
import Roboto from "@/assets/fonts/Roboto-Regular.ttf";
Font.register({
  family: "Roboto",
  src: Roboto,
});
import {
  Page,
  Text,
  View,
  Document,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

import QrCode from "@/assets/qrcode.png";
import Logo from "@/assets/logo.jpg";

// ========== STYLES FOR A5 (148mm x 210mm) ==========
const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontSize: 8,
    fontFamily: "Roboto",
    lineHeight: 1.2,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: "1pt solid #000",
  },

  logoContainer: {
    width: "30%",
  },

  logo: {
    width: 50,
    height: 50,
  },

  companyInfo: {
    width: "68%",
    textAlign: "right",
  },

  companyName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },

  companyText: {
    fontSize: 7,
    color: "#333",
  },

  invoiceTitle: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    textDecoration: "underline",
    marginVertical: 8,
  },

  twoColumns: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  columnLeft: {
    width: "48%",
    alignItems: "flex-start",
  },

  columnRight: {
    width: "48%",
    alignItems: "flex-end",
  },

  sectionLabel: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 3,
  },

  sectionLabelRight: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 3,
    textAlign: "right",
  },

  infoText: {
    fontSize: 7,
    color: "#333",
  },

  infoTextRight: {
    fontSize: 7,
    textAlign: "right",
    color: "#333",
  },

  boldInfo: {
    fontSize: 7,
    fontWeight: "bold",
  },

  boldInfoRight: {
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "right",
  },

  vehicleSection: {
    marginBottom: 8,
    padding: 5,
    backgroundColor: "#f9f9f9",
    borderRadius: 2,
  },

  table: {
    marginTop: 5,
    marginBottom: 8,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e8e8e8",
    borderTop: "1pt solid #000",
    borderBottom: "1pt solid #000",
    paddingVertical: 3,
    paddingHorizontal: 2,
  },

  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #ccc",
    paddingVertical: 3,
    paddingHorizontal: 2,
  },

  headerCell: {
    fontSize: 7,
    fontWeight: "bold",
  },

  cell: {
    fontSize: 7,
  },

  // Column widths to match image:
  colNum: { width: "6%" },
  colName: { width: "32%" },
  colHSN: { width: "15%" },
  colQty: { width: "8%", textAlign: "center" },
  colPrice: { width: "13%", textAlign: "right" },
  colRate: { width: "13%", textAlign: "right" },
  colAmount: { width: "13%", textAlign: "right", paddingRight: 2 },

  amountWordsBox: {
    border: "1pt solid #000",
    padding: 4,
    marginBottom: 8,
  },

  amountWordsLabel: {
    fontSize: 7,
  },

  amountWords: {
    fontSize: 7,
    fontWeight: "bold",
  },

  totalsContainer: {
    width: "50%",
    alignSelf: "flex-end",
    marginBottom: 8,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  totalLabel: {
    fontSize: 7,
  },

  totalValue: {
    fontSize: 7,
    textAlign: "right",
  },

  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1pt solid #000",
    paddingTop: 3,
    marginTop: 2,
  },

  grandTotalLabel: {
    fontSize: 8,
    fontWeight: "bold",
  },

  grandTotalValue: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "right",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTop: "0.5pt solid #ccc",
  },

  serviceInfo: {
    width: "60%",
  },

  qrContainer: {
    width: "35%",
    alignItems: "flex-end",
  },

  qrCode: {
    width: 60,
    height: 60,
  },
});

// ========== HELPER FUNCTIONS ==========

// Currency formatter (without ₹, we add symbol in JSX)
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "0.00";

  return Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const numberToWords = (num) => {
  if (!num || num === 0) return "Zero Rupees only";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
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
  const teens = [
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

  const convert = (n) => {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100)
      return (
        tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "")
      );
    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 ? " " + convert(n % 100) : "")
    );
  };

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  let words = "";
  if (crore > 0) words += convert(crore) + " Crore ";
  if (lakh > 0) words += convert(lakh) + " Lakh ";
  if (thousand > 0) words += convert(thousand) + " Thousand ";
  if (remainder > 0) words += convert(remainder);

  return words.trim() + " Rupees only";
};

const formatDate = (dateString) => {
  if (!dateString) return "--";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Compute GST summary: split totalTax into CGST/SGST/IGST based on item codes
const computeGSTSummary = (items = []) => {
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  let cgstRate = null;
  let sgstRate = null;
  let igstRate = null;

  items.forEach((item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.revisedMRP) || 0;
    const subtotal = qty * price;

    const CG = Number(item.CGSTCode) || 0;
    const SG = Number(item.SGSTCode) || 0;
    const IG = Number(item.IGSTCode) || 0;

    const itemTax = Number(item.taxAmount) || 0;

    if (IG > 0) {
      // Inter-state: IGST only
      igstAmount += itemTax || Math.round((subtotal * IG) / 100);
      if (igstRate === null && IG > 0) igstRate = IG;
    } else {
      // Intra-state: CGST + SGST
      const totalPercent = CG + SG;
      const totalTax =
        itemTax || (totalPercent > 0 ? Math.round((subtotal * totalPercent) / 100) : 0);

      if (totalPercent > 0 && totalTax > 0) {
        const cgAmt = (totalTax * CG) / totalPercent;
        const sgAmt = (totalTax * SG) / totalPercent;

        cgstAmount += cgAmt;
        sgstAmount += sgAmt;
      }

      if (cgstRate === null && CG > 0) cgstRate = CG;
      if (sgstRate === null && SG > 0) sgstRate = SG;
    }
  });

  return {
    cgstAmount,
    sgstAmount,
    igstAmount,
    cgstRate,
    sgstRate,
    igstRate,
  };
};

// ========== MAIN PDF COMPONENT ==========

export default function InvoicePDF({ invoice }) {
  if (!invoice) {
    return (
      <Document>
        <Page size="A5" style={styles.page}>
          <Text>No invoice data available</Text>
        </Page>
      </Document>
    );
  }

  const items = invoice.items || [];
  const totals = invoice.totals || {};
  const customer = invoice.customer || {};
  const vehicle = invoice.vehicle || {};
  const isJobCard = invoice.invoiceType === "job-card";

  const grandTotal = totals.grandTotal || 0;
  const subTotal = totals.subTotal || 0;
  const roundOff = totals.roundOff || 0;

  const {
    cgstAmount,
    sgstAmount,
    igstAmount,
    cgstRate,
    sgstRate,
    igstRate,
  } = computeGSTSummary(items);

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src={Logo} style={styles.logo} />
          </View>

          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>SRM MOTORS</Text>
            <Text style={styles.companyText}>2/89C, Anna Nagar</Text>
            <Text style={styles.companyText}>Jayamkondam Main Road</Text>
            <Text style={styles.companyText}>Sendurai, Ariyalur DT</Text>
            <Text style={styles.companyText}>Phone: 7825914040</Text>
            <Text style={styles.companyText}>
              Email: srmmotorssendurai@gmail.com
            </Text>
            <Text style={styles.companyText}>GSTIN: 33BWLPM0667D1ZM</Text>
            <Text style={styles.companyText}>State: Tamil Nadu</Text>
          </View>
        </View>

        {/* ===== TITLE ===== */}
        <Text style={styles.invoiceTitle}>Tax Invoice</Text>

        {/* ===== BILL TO + INVOICE DETAILS ===== */}
        <View style={styles.twoColumns}>
          <View style={styles.columnLeft}>
            <Text style={styles.sectionLabel}>Bill To</Text>
            <Text style={styles.boldInfo}>{customer.name || "N/A"}</Text>
            <Text style={styles.infoText}>
              Phone: {customer.phone || "N/A"}
            </Text>
          </View>

          <View style={styles.columnRight}>
            <Text style={styles.sectionLabelRight}>Invoice Details</Text>
            <Text style={styles.infoTextRight}>
              Invoice No: {invoice.invoiceNumber || "N/A"}
            </Text>
            <Text style={styles.infoTextRight}>
              Date:{" "}
              {formatDate(invoice.invoiceDate || invoice.createdAt)}
            </Text>
          </View>
        </View>

        {/* ===== VEHICLE SECTION (JOB CARD) ===== */}
        {isJobCard && (
          <View style={styles.vehicleSection}>
            <Text style={styles.sectionLabel}>Vehicle Details</Text>
            <Text style={styles.infoText}>
              Model: {vehicle.model || "--"}
            </Text>
            <Text style={styles.infoText}>
              Reg. No: {vehicle.registrationNumber || "--"}
            </Text>
            <Text style={styles.infoText}>
              KM Reading: {vehicle.kmReading || "--"}
            </Text>
          </View>
        )}

        {/* ===== ITEMS TABLE (LIKE IMAGE) ===== */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.colNum]}>#</Text>
            <Text style={[styles.headerCell, styles.colName]}>Item Name</Text>
            <Text style={[styles.headerCell, styles.colHSN]}>HSN/SAC</Text>
            <Text style={[styles.headerCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.headerCell, styles.colPrice]}>Price/ Unit</Text>
            <Text style={[styles.headerCell, styles.colRate]}>Rate</Text>
            <Text style={[styles.headerCell, styles.colAmount]}>Amount</Text>
          </View>

          {items.length > 0 ? (
            items.map((item, index) => {
              const qty = Number(item.quantity) || 0;
              const unitPrice = Number(item.revisedMRP) || 0;
              // As per image: Amount = Qty × Unit Price (NO GST)
              const amount = qty * unitPrice;

              return (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.cell, styles.colNum]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.cell, styles.colName]}>
                    {item.partName || "N/A"}
                  </Text>
                  <Text style={[styles.cell, styles.colHSN]}>
                    {item.tariff || "000000"}
                  </Text>
                  <Text style={[styles.cell, styles.colQty]}>
                    {qty}
                  </Text>
                  {/* PRICE PER UNIT */}
                  <Text style={[styles.cell, styles.colPrice]}>
                    ₹ {formatCurrency(unitPrice)}
                  </Text>
                  {/* RATE (same as unit price, as per image) */}
                  <Text style={[styles.cell, styles.colRate]}>
                    ₹ {formatCurrency(unitPrice)}
                  </Text>
                  {/* TOTAL AMOUNT WITHOUT GST */}
                  <Text style={[styles.cell, styles.colAmount]}>
                    ₹ {formatCurrency(amount)}
                  </Text>
                </View>
              );
            })
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.cell, styles.colNum]}>1</Text>
              <Text style={[styles.cell, styles.colName]}>
                No items available
              </Text>
              <Text style={[styles.cell, styles.colHSN]}>--</Text>
              <Text style={[styles.cell, styles.colQty]}>0</Text>
              <Text style={[styles.cell, styles.colPrice]}>₹ 0.00</Text>
              <Text style={[styles.cell, styles.colRate]}>₹ 0.00</Text>
              <Text style={[styles.cell, styles.colAmount]}>₹ 0.00</Text>
            </View>
          )}
        </View>

        {/* ===== AMOUNT IN WORDS ===== */}
        <View style={styles.amountWordsBox}>
          <Text style={styles.amountWordsLabel}>Amount in Words:</Text>
          <Text style={styles.amountWords}>
            {numberToWords(Math.round(grandTotal || 0))}
          </Text>
        </View>

        {/* ===== TOTALS (LIKE IMAGE: CGST/SGST SUMMARY) ===== */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              ₹ {formatCurrency(subTotal)}
            </Text>
          </View>

          {/* Intra-state: show CGST + SGST */}
          {sgstAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                SGST{sgstRate ? ` @ ${sgstRate}%` : ""}
              </Text>
              <Text style={styles.totalValue}>
                ₹ {formatCurrency(sgstAmount)}
              </Text>
            </View>
          )}

          {cgstAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                CGST{cgstRate ? ` @ ${cgstRate}%` : ""}
              </Text>
              <Text style={styles.totalValue}>
                ₹ {formatCurrency(cgstAmount)}
              </Text>
            </View>
          )}

          {/* Inter-state: show IGST only if present */}
          {igstAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                IGST{igstRate ? ` @ ${igstRate}%` : ""}
              </Text>
              <Text style={styles.totalValue}>
                ₹ {formatCurrency(igstAmount)}
              </Text>
            </View>
          )}

          {roundOff !== 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Round Off</Text>
              <Text style={styles.totalValue}>
                {roundOff > 0 ? "+ " : "- "}₹{" "}
                {formatCurrency(Math.abs(roundOff))}
              </Text>
            </View>
          )}

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              ₹ {formatCurrency(grandTotal)}
            </Text>
          </View>
        </View>

        {/* ===== FOOTER ===== */}
        <View style={styles.footer}>
          <View style={styles.serviceInfo}>
            {isJobCard && (
              <>
                <Text style={styles.infoText}>
                  Next Service Date:{" "}
                  {formatDate(vehicle.nextServiceDate)}
                </Text>
                <Text style={styles.infoText}>
                  Next Service KM: {vehicle.nextServiceKm || "--"}
                </Text>
              </>
            )}
          </View>

          <View style={styles.qrContainer}>
            <Image src={QrCode} style={styles.qrCode} />
          </View>
        </View>
      </Page>
    </Document>
  );
}
