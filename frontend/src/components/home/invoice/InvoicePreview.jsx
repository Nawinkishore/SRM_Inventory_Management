import React from "react";
import { PDFViewer } from "@react-pdf/renderer";
import InvoicePDF from "./InvoicePDF"; // your template file

const InvoicePreview = () => {
  // sample data to test layout
  
  const invoice = {
    invoiceNumber: "INV-0001",
    createdAt: new Date(),
    customer: {
      name: "Nawin Kishore",
      phone: "9361609386",
    },
    items: [
      {
        partName: "Brake Pad",
        quantity: 2,
        revisedMRP: 250,
        taxAmount: 50,
        finalAmount: 300,
      },
      {
        partName: "Engine Oil",
        quantity: 1,
        revisedMRP: 500,
        taxAmount: 90,
        finalAmount: 590,
      },
    ],
    totals: {
      subTotal: 1000,
      totalTax: 140,
      grandTotal: 1140,
    },
  };

  return (
    <div style={{ height: "100vh" }}>
      <PDFViewer width="100%" height="100%">
        <InvoicePDF invoice={invoice} />
      </PDFViewer>
    </div>
  );
};

export default InvoicePreview;
