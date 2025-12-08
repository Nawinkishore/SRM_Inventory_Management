// InvoicePDF.jsx - Clean A5 Invoice with Proper Spacing

import React from "react";
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
    fontFamily: "Helvetica",
    lineHeight: 1.2,
  },

  // Header Section
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
    lineHeight: 1.3,
    color: "#333",
  },

  // Invoice Title
  invoiceTitle: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    textDecoration: "underline",
    marginVertical: 8,
  },

  // Two Column Layout
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
    color: "#000",
  },

  sectionLabelRight: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#000",
    textAlign: "right",
  },

  infoText: {
    fontSize: 7,
    lineHeight: 1.4,
    color: "#333",
  },

  infoTextRight: {
    fontSize: 7,
    lineHeight: 1.4,
    color: "#333",
    textAlign: "right",
  },

  boldInfo: {
    fontSize: 7,
    fontWeight: "bold",
    lineHeight: 1.4,
  },

  boldInfoRight: {
    fontSize: 7,
    fontWeight: "bold",
    lineHeight: 1.4,
    textAlign: "right",
  },

  // Vehicle Details (for job-card)
  vehicleSection: {
    marginBottom: 8,
    padding: 5,
    backgroundColor: "#f9f9f9",
    borderRadius: 2,
  },

  // Table Styles
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

  // Column widths
  colNum: { width: "5%" },
  colName: { width: "28%" },
  colCode: { width: "15%" },
  colHSN: { width: "12%" },
  colMRP: { width: "13%", textAlign: "right" },
  colGST: { width: "10%", textAlign: "right" },
  colAmount: { width: "17%", textAlign: "right", paddingRight: 2 },

  // Amount in Words
  amountWordsBox: {
    border: "1pt solid #000",
    padding: 4,
    marginBottom: 8,
  },

  amountWordsLabel: {
    fontSize: 7,
    marginBottom: 1,
  },

  amountWords: {
    fontSize: 7,
    fontWeight: "bold",
  },

  // Totals Section
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

  // Footer Section
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

  serviceLabel: {
    fontSize: 7,
    fontWeight: "bold",
    marginBottom: 1,
  },

  serviceValue: {
    fontSize: 7,
    marginBottom: 4,
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

const numberToWords = (num) => {
  if (!num || num === 0) return "Zero Rupees only";

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

  const convert = (n) => {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
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

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "₹ 0.00";
  return `₹ ${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "--";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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

  // Extract invoice data
  const items = invoice.items || [];
  const totals = invoice.totals || {};
  const customer = invoice.customer || {};
  const vehicle = invoice.vehicle || {};
  const isJobCard = invoice.invoiceType === "job-card";

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        {/* ========== HEADER ========== */}
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
            <Text style={styles.companyText}>Email: srmmotorssendurai@gmail.com</Text>
            <Text style={styles.companyText}>GSTIN: 33BWLPM0667D1ZM</Text>
            <Text style={styles.companyText}>State: Tamil Nadu</Text>
          </View>
        </View>

        {/* ========== INVOICE TITLE ========== */}
        <Text style={styles.invoiceTitle}>Tax Invoice</Text>

        {/* ========== BILL TO & INVOICE DETAILS ========== */}
        <View style={styles.twoColumns}>
          {/* Bill To - Left Aligned */}
          <View style={styles.columnLeft}>
            <Text style={styles.sectionLabel}>Bill To</Text>
            <Text style={styles.boldInfo}>{customer.name || "N/A"}</Text>
            <Text style={styles.infoText}>Phone: {customer.phone || "N/A"}</Text>
          </View>

          {/* Invoice Details - Right Aligned */}
          <View style={styles.columnRight}>
            <Text style={styles.sectionLabelRight}>Invoice Details</Text>
            <Text style={styles.infoTextRight}>Invoice No: {invoice.invoiceNumber || "N/A"}</Text>
            <Text style={styles.infoTextRight}>Date: {formatDate(invoice.invoiceDate || invoice.createdAt)}</Text>
          </View>
        </View>

        {/* ========== VEHICLE DETAILS (Only for Job Card) ========== */}
        {isJobCard && (
          <View style={styles.vehicleSection}>
            <Text style={styles.sectionLabel}>Vehicle Details</Text>
            <Text style={styles.infoText}>Model: {vehicle.model || "--"}</Text>
            <Text style={styles.infoText}>Reg. No: {vehicle.registrationNumber || "--"}</Text>
            <Text style={styles.infoText}>KM Reading: {vehicle.kmReading || "--"}</Text>
          </View>
        )}

        {/* ========== ITEMS TABLE ========== */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.colNum]}>#</Text>
            <Text style={[styles.headerCell, styles.colName]}>Item Name</Text>
            <Text style={[styles.headerCell, styles.colCode]}>Item Code</Text>
            <Text style={[styles.headerCell, styles.colHSN]}>HSN/SAC</Text>
            <Text style={[styles.headerCell, styles.colMRP]}>MRP</Text>
            <Text style={[styles.headerCell, styles.colGST]}>GST</Text>
            <Text style={[styles.headerCell, styles.colAmount]}>Amount</Text>
          </View>

          {/* Table Rows */}
          {items.length > 0 ? (
            items.map((item, index) => {
              const gstTotal = (item.CGSTCode || 0) + (item.SGSTCode || 0);
              return (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.cell, styles.colNum]}>{index + 1}</Text>
                  <Text style={[styles.cell, styles.colName]}>{item.partName || "N/A"}</Text>
                  <Text style={[styles.cell, styles.colCode]}>{item.partNo || "N/A"}</Text>
                  <Text style={[styles.cell, styles.colHSN]}>{item.tariff || "000000"}</Text>
                  <Text style={[styles.cell, styles.colMRP]}>{formatCurrency(item.revisedMRP || 0)}</Text>
                  <Text style={[styles.cell, styles.colGST]}>{gstTotal}%</Text>
                  <Text style={[styles.cell, styles.colAmount]}>{formatCurrency(item.finalAmount || 0)}</Text>
                </View>
              );
            })
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.cell, styles.colNum]}>1</Text>
              <Text style={[styles.cell, styles.colName]}>No items available</Text>
              <Text style={[styles.cell, styles.colCode]}>--</Text>
              <Text style={[styles.cell, styles.colHSN]}>--</Text>
              <Text style={[styles.cell, styles.colMRP]}>₹ 0.00</Text>
              <Text style={[styles.cell, styles.colGST]}>0%</Text>
              <Text style={[styles.cell, styles.colAmount]}>₹ 0.00</Text>
            </View>
          )}
        </View>

        {/* ========== AMOUNT IN WORDS ========== */}
        <View style={styles.amountWordsBox}>
          <Text style={styles.amountWordsLabel}>Amount in Words:</Text>
          <Text style={styles.amountWords}>
            {numberToWords(Math.round(totals.grandTotal || 0))}
          </Text>
        </View>

        {/* ========== TOTALS ========== */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(totals.subTotal || 0)}</Text>
          </View>

          {totals.totalTax > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Tax (GST)</Text>
              <Text style={styles.totalValue}>{formatCurrency(totals.totalTax)}</Text>
            </View>
          )}

          {totals.roundOff !== 0 && totals.roundOff !== undefined && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Round Off</Text>
              <Text style={styles.totalValue}>
                {totals.roundOff > 0 ? "+" : ""}{formatCurrency(Math.abs(totals.roundOff))}
              </Text>
            </View>
          )}

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(totals.grandTotal || 0)}</Text>
          </View>
        </View>

        {/* ========== FOOTER ========== */}
        <View style={styles.footer}>
          <View style={styles.serviceInfo}>
            {isJobCard && (
              <>
                <Text style={styles.serviceLabel}>Next Service Date:</Text>
                <Text style={styles.serviceValue}>
                  {formatDate(vehicle.nextServiceDate) || "--"}
                </Text>

                <Text style={styles.serviceLabel}>Next Service KM:</Text>
                <Text style={styles.serviceValue}>
                  {vehicle.nextServiceKm || "--"}
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