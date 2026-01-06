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
import AddItem from "./pages/dashboard/productItems/AddItem";
import EditItem from "./pages/dashboard/items/EditItem";
import Quotation from "./pages/dashboard/quotation/Quotation";
import AddQuotation from "./pages/dashboard/quotation/AddQuotation";
import ViewQuotation from "./pages/dashboard/quotation/ViewQuotation";
import Excel from "./pages/dashboard/excel/Excel";
import Item from "./pages/dashboard/productItems/Item";
import ItemDetails from "./pages/dashboard/productItems/ItemDetails";
import ItemId from "./pages/dashboard/productItems/itemId";

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
          <Route
            path="/sign-in/*"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/sign-up/*"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route path="/dashboard" element={<DashBoard />}>
            <Route index element={<Home />} />
            <Route path="invoice" element={<InvoiceGenerator />} />
            <Route path="invoices" element={<InvoiceList />} />
            <Route path="invoice/:id" element={<InvoiceId />} />
            {/* <Route path="stocks" element={<Stock />} /> */}
            {/* <Route path="stocks/add" element={<AddItem />} /> */}
            {/* <Route path="stocks/edit/:id" element={<EditItem />} /> */}
            <Route path="quotation" element={<Quotation />} />
            <Route path="quotation/add" element={<AddQuotation />} />
            <Route path="quotation/view/:id" element={<ViewQuotation />} />
            <Route path="excel" element={<Excel />} />
            <Route path="productitems" element={<Item />} />
            <Route path="productitems/itemdetails" element={<ItemDetails />} />
            <Route path="productitems/itemId/:id" element={<ItemId />} />
            <Route path="productitems/add" element={<AddItem />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            
          </Route>
        </Routes>
      </SignedIn>
    </>
  );
}

export default App;
