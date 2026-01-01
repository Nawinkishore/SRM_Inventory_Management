// QuotationPDF.jsx
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

  title: {
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

  columnLeft: { width: "48%" },
  columnRight: { width: "48%", alignItems: "flex-end" },

  boldInfo: { fontSize: 7, fontWeight: "bold", marginBottom: 1 },
  infoText: { fontSize: 6.5, color: "#333", marginBottom: 1 },
  infoTextRight: { fontSize: 6.5, textAlign: "right", marginBottom: 1 },

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

  colNum: { width: "8%" },
  colItem: { width: "32%" },
  colPartNo: { width: "20%" },
  colQty: { width: "10%", textAlign: "center" },
  colRate: { width: "15%", textAlign: "right" },
  colTotal: { width: "15%", textAlign: "right" },

  totalsContainer: { width: "45%", alignSelf: "flex-end", marginTop: 3 },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1pt solid #000",
    paddingTop: 3,
    marginTop: 2,
  },
  grandTotalLabel: { fontSize: 8, fontWeight: "bold" },
  grandTotalValue: { fontSize: 8, fontWeight: "bold" },

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

export default function QuotationPDF({ quotation }) {
  if (!quotation)
    return (
      <Document>
        <Page size="A5" style={styles.page}>
          <Text>No data</Text>
        </Page>
      </Document>
    );

  const items = quotation.items || [];
  const customer = quotation.customer || {};

  let totalMRP = 0;
  items.forEach((item) => {
    totalMRP += (Number(item.MRP) || 0) * (Number(item.quantity) || 0);
  });

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
          </View>
        </View>

        <Text style={styles.title}>QUOTATION</Text>

        {/* CUSTOMER & QUOTATION INFO */}
        <View style={styles.twoColumns}>
          <View style={styles.columnLeft}>
            <Text style={styles.boldInfo}>{customer.name || "N/A"}</Text>
            <Text style={styles.infoText}>
              Phone: {customer.phone || "N/A"}
            </Text>
          </View>

          <View style={styles.columnRight}>
            <Text style={styles.infoTextRight}>
              Quotation No: {quotation.quotationNumber}
            </Text>
            <Text style={styles.infoTextRight}>
              Date: {formatDate(quotation.date)}
            </Text>
          </View>
        </View>

        {/* TABLE */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.colNum]}>#</Text>
            <Text style={[styles.headerCell, styles.colItem]}>Item</Text>
            <Text style={[styles.headerCell, styles.colPartNo]}>
              Part No
            </Text>
            <Text style={[styles.headerCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.headerCell, styles.colRate]}>Rate</Text>
            <Text style={[styles.headerCell, styles.colTotal]}>Total</Text>
          </View>

          {items.map((item, i) => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.MRP) || 0;
            const total = qty * price;

            return (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.cell, styles.colNum]}>{i + 1}</Text>

                <Text style={[styles.cell, styles.colItem]}>
                  {item.partName}
                </Text>

                <Text style={[styles.cell, styles.colPartNo]}>
                  {item.partNo || "--"}
                </Text>

                <Text style={[styles.cell, styles.colQty]}>{qty}</Text>

                <Text style={[styles.cell, styles.colRate]}>
                  ₹{formatCurrency(price)}
                </Text>

                <Text style={[styles.cell, styles.colTotal]}>
                  ₹{formatCurrency(total)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* TOTAL */}
        <View style={styles.totalsContainer}>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>
              ₹{formatCurrency(totalMRP)}
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This quotation is valid for 7 days.
          </Text>

          <View style={styles.qrContainer}>
            <Image src={QrCode} style={styles.qrCode} />
          </View>
        </View>
      </Page>
    </Document>
  );
}
