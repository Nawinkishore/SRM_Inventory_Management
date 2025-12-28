import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import DashBoard from "./pages/DashBoard";
import Home from "./pages/dashboard/Home";
import Profile from "./pages/dashboard/profile/Profile";
import InvoiceGenerator from "./pages/dashboard/invoice/InvoiceGenerator";
import InvoiceList from "./pages/dashboard/invoice/InvoiceList";
import Purchase from "./pages/dashboard/Purchase/Purchase";
import AddStockPage from "./pages/stocksPage/AddStockPage";
import PurchaseId from "./pages/dashboard/Purchase/PurchaseId";
import QuotationPage from "./pages/dashboard/invoice/QuotationPage";
import InvoiceId from "./pages/dashboard/invoice/InvoiceId";
import InvoicePreview from "./components/home/invoice/InvoicePreview";
import { Toaster } from "sonner";

import { SignedIn, SignedOut, SignIn, SignUp } from "@clerk/clerk-react";

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />

      {/* Routes for Signed Out Users */}
      <SignedOut>
        <Routes>
          <Route 
            path="/sign-in/*" 
            element={
              <div className="flex items-center justify-center h-screen">
                <SignIn routing="path" path="/sign-in" />
              </div>
            } 
          />
          <Route 
            path="/sign-up/*" 
            element={
              <div className="flex items-center justify-center h-screen">
                <SignUp routing="path" path="/sign-up" />
              </div>
            } 
          />
          <Route path="*" element={<Navigate to="/sign-in" replace />} />
        </Routes>
      </SignedOut>

      {/* Routes for Signed In Users */}
      <SignedIn>
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Redirect auth pages to dashboard if already signed in */}
          <Route path="/sign-in/*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/sign-up/*" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashBoard />}>
            <Route index element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path="quotation" element={<QuotationPage />} />
            <Route path="invoice" element={<InvoiceGenerator />} />
            <Route path="invoices" element={<InvoiceList />} />
            <Route path="invoice/:id" element={<InvoiceId />} />
            <Route path="purchase" element={<Purchase />} />
            <Route path="purchase/stocks/add" element={<AddStockPage />} />
            <Route path="purchase/:purchaseId" element={<PurchaseId />} />
          </Route>

          {/* Standalone Invoice Preview Route */}
          <Route path="/invoice/check" element={<InvoicePreview />} />
        </Routes>
      </SignedIn>
    </>
  );
}

export default App;