import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashBoard from "./pages/DashBoard";
import Home from "./pages/dashboard/Home";
import Profile from "./pages/dashboard/profile/Profile";
import InvoiceGenerator from "./pages/dashboard/invoice/InvoiceGenerator";
import Login from "./pages/authentication/Login";
import InvoiceList from "./pages/dashboard/invoice/InvoiceList";
import Purchase from "./pages/dashboard/Purchase/Purchase";
import AddStockPage from "./pages/stocksPage/AddStockPage";
import PurchaseId from "./pages/dashboard/Purchase/PurchaseId";
import QuotationPage from "./pages/dashboard/invoice/QuotationPage";
import InvoiceId from "./pages/dashboard/invoice/InvoiceId";
import InvoicePreview from "./components/home/invoice/InvoicePreview";
import { Toaster } from "sonner";

function App() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <p>Loading...</p>;

  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Root */}
        <Route
          path="/"
          element={
            <Navigate to={isSignedIn ? "/dashboard" : "/login"} replace />
          }
        />

        {/* Auth */}
        <Route
          path="/login"
          element={!isSignedIn ? <Login /> : <Navigate to="/dashboard" />}
        />

        {/* Public */}
        <Route path="/invoice/check" element={<InvoicePreview />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          }
        >
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
      </Routes>
    </>
  );
}

export default App;
