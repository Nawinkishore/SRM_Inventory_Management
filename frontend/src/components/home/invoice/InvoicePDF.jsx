// InvoicePDF.jsx

import React from "react";
import { Font } from "@react-pdf/renderer";
import Roboto from "@/assets/fonts/Roboto-Regular.ttf";
Font.register({ family: "Roboto", src: Roboto });

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

// ================= STYLES =================
const styles = StyleSheet.create({
  page: { padding: 12, fontSize: 7, fontFamily: "Roboto", lineHeight: 1.1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingBottom: 5,
    borderBottom: "1pt solid #000",
  },

  logoContainer: { width: "28%" },
  logo: { width: 45, height: 45 },
  companyInfo: { width: "70%", textAlign: "right" },
  companyName: { fontSize: 11, fontWeight: "bold", marginBottom: 2 },
  companyText: { fontSize: 6.5, color: "#333", marginBottom: 0.5 },

  invoiceTitle: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    textDecoration: "underline",
    marginVertical: 5,
  },

  twoColumns: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  columnLeft: { width: "48%", alignItems: "flex-start" },
  columnRight: { width: "48%", alignItems: "flex-end" },

  sectionLabel: { fontSize: 7, fontWeight: "bold", marginBottom: 2 },
  sectionLabelRight: {
    fontSize: 7,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "right",
  },

  infoText: { fontSize: 6.5, color: "#333", marginBottom: 0.5 },
  infoTextRight: {
    fontSize: 6.5,
    textAlign: "right",
    color: "#333",
    marginBottom: 0.5,
  },

  boldInfo: { fontSize: 7, fontWeight: "bold", marginBottom: 1 },

  // ===== VEHICLE BOX =====
  vehicleSection: {
    marginBottom: 6,
    padding: 4,
    backgroundColor: "#f5f5f5",
    borderRadius: 2,
    border: "0.5pt solid #ddd",
  },
  vehicleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  vehicleLabel: { fontSize: 6.5, fontWeight: "bold", width: "40%" },
  vehicleValue: { fontSize: 6.5, width: "60%" },

  table: { marginTop: 4, marginBottom: 5 },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderTop: "1pt solid #000",
    borderBottom: "1pt solid #000",
    paddingVertical: 2,
    paddingHorizontal: 2,
  },

  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #ddd",
    paddingVertical: 2,
    paddingHorizontal: 2,
  },

  headerCell: { fontSize: 6.5, fontWeight: "bold" },
  cell: { fontSize: 6.5 },

  colNum: { width: "5%" },
  colItem: { width: "28%" },
  colHSN: { width: "10%" },
  colMRP: { width: "12%", textAlign: "right" },
  colGST: { width: "10%", textAlign: "right" },
  colGSTAmt: { width: "13%", textAlign: "right" },
  colQty: { width: "7%", textAlign: "center" },
  colTotal: { width: "15%", textAlign: "right", paddingRight: 2 },

  totalsContainer: { width: "45%", alignSelf: "flex-end", marginTop: 3 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1.5,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1pt solid #000",
    paddingTop: 2,
    marginTop: 2,
  },
  grandTotalLabel: { fontSize: 7.5, fontWeight: "bold" },
  grandTotalValue: { fontSize: 7.5, fontWeight: "bold" },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 5,
    borderTop: "0.5pt solid #ccc",
  },

  footerText: { fontSize: 6.5 },
  qrContainer: { width: "35%", alignItems: "flex-end" },
  qrCode: { width: 50, height: 50 },
});

// ================= HELPERS =================
const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "--";

// ================= MAIN COMPONENT =================
export default function InvoicePDF({ invoice }) {
  if (!invoice)
    return (
      <Document>
        <Page size="A5" style={styles.page}>
          <Text>No data</Text>
        </Page>
      </Document>
    );

  const items = invoice.items || [];
  const customer = invoice.customer || {};
  const vehicle = invoice.vehicle || {};

  const invoiceType = invoice.invoiceType || "";
  const isJobCard =
    invoiceType === "job_card" || invoiceType === "job-card";

  // ======== TOTAL CALCULATIONS =========
  let subTotal = 0;
  let totalGST = 0;

  items.forEach((item) => {
    const qty = Number(item.quantity) || 0;
    const mrp = Number(item.revisedMRP) || 0;

    const gstRate =
      (Number(item.CGSTCode) || 0) +
      (Number(item.SGSTCode) || 0);

    const lineBase = mrp * qty;
    const lineGST = (lineBase * gstRate) / 100;

    subTotal += lineBase;
    totalGST += lineGST;
  });

  const cgstAmount = totalGST / 2;
  const sgstAmount = totalGST / 2;

  const gstRate =
    (Number(items[0]?.CGSTCode) || 0) +
    (Number(items[0]?.SGSTCode) || 0);

  const halfRate = gstRate / 2;

  const grandTotal = subTotal + totalGST;

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        {/* HEADER */}
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

        <Text style={styles.invoiceTitle}>Tax Invoice</Text>

        {/* CUSTOMER */}
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
              Invoice No: {invoice.invoiceNumber}
            </Text>
            <Text style={styles.infoTextRight}>
              Date: {formatDate(invoice.invoiceDate)}
            </Text>
            <Text style={styles.infoTextRight}>
              Type: {invoiceType.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* ===== VEHICLE INFO (ONLY JOB CARD) ===== */}
        {isJobCard && (
          <View style={styles.vehicleSection}>
            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleLabel}>Model:</Text>
              <Text style={styles.vehicleValue}>
                {vehicle.model || "--"}
              </Text>
            </View>

            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleLabel}>Registration No:</Text>
              <Text style={styles.vehicleValue}>
                {vehicle.registrationNumber || "--"}
              </Text>
            </View>

            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleLabel}>Frame No:</Text>
              <Text style={styles.vehicleValue}>
                {vehicle.frameNumber || "--"}
              </Text>
            </View>

            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleLabel}>Next Service Date:</Text>
              <Text style={styles.vehicleValue}>
                {formatDate(vehicle.nextServiceDate)}
              </Text>
            </View>

            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleLabel}>Next Service KM:</Text>
              <Text style={styles.vehicleValue}>
                {vehicle.nextServiceKm || "--"}
              </Text>
            </View>
          </View>
        )}

        {/* TABLE */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.colNum]}>#</Text>
            <Text style={[styles.headerCell, styles.colItem]}>
              Item / Part No
            </Text>
            <Text style={[styles.headerCell, styles.colHSN]}>HSN/SAC</Text>
            <Text style={[styles.headerCell, styles.colMRP]}>
              Amount (MRP)
            </Text>
            <Text style={[styles.headerCell, styles.colGST]}>GST%</Text>
            <Text style={[styles.headerCell, styles.colGSTAmt]}>
              GST Amount
            </Text>
            <Text style={[styles.headerCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.headerCell, styles.colTotal]}>Total</Text>
          </View>

          {items.map((item, i) => {
            const qty = Number(item.quantity) || 0;
            const mrp = Number(item.revisedMRP) || 0;
            const rate =
              (Number(item.CGSTCode) || 0) +
              (Number(item.SGSTCode) || 0);

            const base = mrp * qty;
            const gst = (base * rate) / 100;
            const total = base + gst;

            return (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.cell, styles.colNum]}>{i + 1}</Text>

                <View style={styles.colItem}>
                  <Text>{item.partName}</Text>
                  <Text style={{ fontSize: 6, color: "#555" }}>
                    {item.partNo}
                  </Text>
                </View>

                <Text style={[styles.cell, styles.colHSN]}>
                  {item.hsnCode || item.tariff}
                </Text>

                <Text style={[styles.cell, styles.colMRP]}>
                  ₹{formatCurrency(base)}
                </Text>

                <Text style={[styles.cell, styles.colGST]}>
                  {rate}%
                </Text>

                <Text style={[styles.cell, styles.colGSTAmt]}>
                  ₹{formatCurrency(gst)}
                </Text>

                <Text style={[styles.cell, styles.colQty]}>{qty}</Text>

                <Text style={[styles.cell, styles.colTotal]}>
                  ₹{formatCurrency(total)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* TOTALS */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>₹{formatCurrency(subTotal)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text>SGST @ {halfRate}%</Text>
            <Text>₹{formatCurrency(sgstAmount)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text>CGST @ {halfRate}%</Text>
            <Text>₹{formatCurrency(cgstAmount)}</Text>
          </View>

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              ₹{formatCurrency(grandTotal)}
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for your business!
          </Text>

          <View style={styles.qrContainer}>
            <Image src={QrCode} style={styles.qrCode} />
          </View>
        </View>
      </Page>
    </Document>
  );
}
