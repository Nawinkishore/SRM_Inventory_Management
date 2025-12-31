import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import DashBoard from "./pages/DashBoard";
import Home from "./pages/dashboard/Home";
import InvoiceGenerator from "./pages/dashboard/invoice/InvoiceGenerator";
import InvoiceList from "./pages/dashboard/invoice/InvoiceList";
import Stock from "./pages/dashboard/items/Stock";
import InvoiceId from "./pages/dashboard/invoice/InvoiceId";
import { Toaster } from "sonner";

import { SignedIn, SignedOut, SignIn, SignUp } from "@clerk/clerk-react";
import AddItem from "./pages/dashboard/items/AddItem";
import EditItem from "./pages/dashboard/items/EditItem";

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
            <Route path="invoice" element={<InvoiceGenerator />} />
            <Route path="invoices" element={<InvoiceList />} />
            <Route path="invoice/:id" element={<InvoiceId />} />
            <Route path="stocks" element={<Stock />} />
            <Route path="stocks/add" element={<AddItem />} />
            <Route path="/dashboard/stocks/edit/:id" element={<EditItem />} />

       
          </Route>
        </Routes>
      </SignedIn>
    </>
  );
}

export default App;