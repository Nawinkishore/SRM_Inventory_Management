// InvoicePDF.jsx - Dynamic Invoice PDF Component

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

// ---- Styles matching the PDF layout ----
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 9,
    fontFamily: "Helvetica",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  logoSection: {
    width: "25%",
  },

  logo: {
    width: 60,
    height: 60,
  },

  companySection: {
    width: "70%",
    alignItems: "flex-end",
  },

  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
  },

  companyText: {
    fontSize: 8,
    textAlign: "right",
    lineHeight: 1.3,
  },

  invoiceTitle: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    textDecoration: "underline",
  },

  twoColumnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  column: {
    width: "48%",
  },

  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
  },

  regularText: {
    fontSize: 8,
    lineHeight: 1.4,
  },

  boldText: {
    fontSize: 8,
    fontWeight: "bold",
    lineHeight: 1.4,
  },

  table: {
    marginBottom: 10,
  },

  tableHeader: {
    flexDirection: "row",
    borderTop: "1px solid #000",
    borderBottom: "1px solid #000",
    paddingVertical: 4,
    backgroundColor: "#f0f0f0",
  },

  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #ccc",
    paddingVertical: 4,
  },

  col1: { width: "5%", fontSize: 8, paddingLeft: 2 },
  col2: { width: "30%", fontSize: 8, paddingLeft: 2 },
  col3: { width: "18%", fontSize: 8, paddingLeft: 2 },
  col4: { width: "12%", fontSize: 8, paddingLeft: 2 },
  col5: { width: "13%", fontSize: 8, paddingLeft: 2, textAlign: "right" },
  col6: { width: "10%", fontSize: 8, paddingLeft: 2, textAlign: "right" },
  col7: { width: "12%", fontSize: 8, paddingLeft: 2, textAlign: "right", paddingRight: 2 },

  headerText: {
    fontWeight: "bold",
  },

  amountWordsBox: {
    border: "1px solid #000",
    padding: 6,
    marginBottom: 10,
  },

  amountWordsLabel: {
    fontSize: 8,
    marginBottom: 2,
  },

  amountWordsValue: {
    fontSize: 8,
    fontWeight: "bold",
  },

  totalsSection: {
    marginLeft: "55%",
    marginBottom: 12,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },

  totalLabel: {
    fontSize: 8,
    width: "60%",
  },

  totalValue: {
    fontSize: 8,
    width: "40%",
    textAlign: "right",
  },

  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1px solid #000",
    paddingTop: 3,
    marginTop: 3,
  },

  grandTotalLabel: {
    fontSize: 9,
    fontWeight: "bold",
    width: "60%",
  },

  grandTotalValue: {
    fontSize: 9,
    fontWeight: "bold",
    width: "40%",
    textAlign: "right",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  serviceInfo: {
    width: "60%",
  },

  serviceLabel: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 2,
  },

  serviceValue: {
    fontSize: 8,
    marginBottom: 6,
  },

  qrSection: {
    width: "35%",
    alignItems: "flex-end",
  },

  qrCode: {
    width: 70,
    height: 70,
  },
});

// Helper function to convert number to words
const numberToWords = (num) => {
  if (!num || num === 0) return "Zero Rupees only";
  
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

  const convertLessThanThousand = (n) => {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convertLessThanThousand(n % 100) : "");
  };

  const crores = Math.floor(num / 10000000);
  const lakhs = Math.floor((num % 10000000) / 100000);
  const thousands = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  let words = "";
  if (crores > 0) words += convertLessThanThousand(crores) + " Crore ";
  if (lakhs > 0) words += convertLessThanThousand(lakhs) + " Lakh ";
  if (thousands > 0) words += convertLessThanThousand(thousands) + " Thousand ";
  if (remainder > 0) words += convertLessThanThousand(remainder);

  return words.trim() + " Rupees only";
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "--";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Helper function to format currency
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "₹ 0.00";
  return `₹ ${Number(amount).toFixed(2)}`;
};

// --------------------------
// DYNAMIC INVOICE PDF
// --------------------------
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

  const {
    invoiceNumber = "N/A",
    customer = {},
    items = [],
    totals = {},
    createdAt,
    nextServiceDate,
    nextServiceKms,
  } = invoice;

  const customerName = customer?.name || "N/A";
  const customerPhone = customer?.phone || "N/A";
  
  const subTotal = totals?.subTotal || 0;
  const sgst = totals?.sgst || 0;
  const cgst = totals?.cgst || 0;
  const igst = totals?.igst || 0;
  const grandTotal = totals?.grandTotal || 0;

  // Calculate GST percentages
  const gstRate = items.length > 0 && items[0]?.gst ? items[0].gst : 18;
  const sgstRate = gstRate / 2;
  const cgstRate = gstRate / 2;

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        {/* HEADER: Logo + Company Info */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image style={styles.logo} src={Logo} />
          </View>

          <View style={styles.companySection}>
            <Text style={styles.companyName}>SRM MOTORS</Text>
            <Text style={styles.companyText}>2/89C, Anna Nagar,</Text>
            <Text style={styles.companyText}>Jayamkondam Main road,</Text>
            <Text style={styles.companyText}>Sendurai Po & Tk</Text>
            <Text style={styles.companyText}>Ariyalur DT</Text>
            <Text style={styles.companyText}>Phone no.: 7825914040</Text>
            <Text style={styles.companyText}>Email: srmmotorssendurai@gmail.com</Text>
            <Text style={styles.companyText}>GSTIN: 33BWLPM0667D1ZM</Text>
            <Text style={styles.companyText}>State: 33-Tamil Nadu</Text>
          </View>
        </View>

        {/* TAX INVOICE TITLE */}
        <Text style={styles.invoiceTitle}>Tax Invoice</Text>

        {/* TWO COLUMN: Bill To + Invoice Details */}
        <View style={styles.twoColumnRow}>
          {/* Left: Bill To */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.boldText}>{customerName}</Text>
            <Text style={styles.regularText}>Contact No.: {customerPhone}</Text>
          </View>

          {/* Right: Invoice Details */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <Text style={styles.regularText}>Invoice No.: {invoiceNumber}</Text>
            <Text style={styles.regularText}>Date: {formatDate(createdAt)}</Text>
          </View>
        </View>

        {/* ITEMS TABLE */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.headerText]}>#</Text>
            <Text style={[styles.col2, styles.headerText]}>Item Name</Text>
            <Text style={[styles.col3, styles.headerText]}>Item Code</Text>
            <Text style={[styles.col4, styles.headerText]}>HSN/ SAC</Text>
            <Text style={[styles.col5, styles.headerText]}>Price/ Unit</Text>
            <Text style={[styles.col6, styles.headerText]}>GST</Text>
            <Text style={[styles.col7, styles.headerText]}>Amount</Text>
          </View>

          {/* Table Rows */}
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>{index + 1}</Text>
                <Text style={styles.col2}>{item.itemName || "N/A"}</Text>
                <Text style={styles.col3}>{item.itemCode || "N/A"}</Text>
                <Text style={styles.col4}>{item.hsnSac || "N/A"}</Text>
                <Text style={styles.col5}>
                  {formatCurrency(item.pricePerUnit)}
                </Text>
                <Text style={styles.col6}>{item.gst || 0}%</Text>
                <Text style={styles.col7}>
                  {formatCurrency(item.totalAmount)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={styles.col1}>1</Text>
              <Text style={styles.col2}>No items</Text>
              <Text style={styles.col3}>--</Text>
              <Text style={styles.col4}>--</Text>
              <Text style={styles.col5}>₹ 0.00</Text>
              <Text style={styles.col6}>0%</Text>
              <Text style={styles.col7}>₹ 0.00</Text>
            </View>
          )}
        </View>

        {/* AMOUNT IN WORDS BOX */}
        <View style={styles.amountWordsBox}>
          <Text style={styles.amountWordsLabel}>Invoice Amount In Words</Text>
          <Text style={styles.amountWordsValue}>
            {numberToWords(Math.round(grandTotal))}
          </Text>
        </View>

        {/* TOTALS SECTION */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sub Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(subTotal)}</Text>
          </View>

          {sgst > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>SGST@{sgstRate}%</Text>
              <Text style={styles.totalValue}>{formatCurrency(sgst)}</Text>
            </View>
          )}

          {cgst > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>CGST@{cgstRate}%</Text>
              <Text style={styles.totalValue}>{formatCurrency(cgst)}</Text>
            </View>
          )}

          {igst > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IGST@{gstRate}%</Text>
              <Text style={styles.totalValue}>{formatCurrency(igst)}</Text>
            </View>
          )}

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(grandTotal)}
            </Text>
          </View>
        </View>

        {/* FOOTER: Service Info + QR Code */}
        <View style={styles.footer}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceLabel}>Next Service Date:</Text>
            <Text style={styles.serviceValue}>
              {nextServiceDate ? formatDate(nextServiceDate) : "--"}
            </Text>
            <Text style={styles.serviceLabel}>Next Service Kms:</Text>
            <Text style={styles.serviceValue}>
              {nextServiceKms || "--"}
            </Text>
          </View>

          <View style={styles.qrSection}>
            <Image src={QrCode} style={styles.qrCode} />
          </View>
        </View>
      </Page>
    </Document>
  );
}