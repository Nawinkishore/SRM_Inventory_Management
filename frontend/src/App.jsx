import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCheckAuth } from "./features/auth/hooks/useCheckAuth";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashBoard from "./pages/DashBoard";
import Home from "./pages/dashboard/Home";
import Profile from "./pages/dashboard/Profile";
import InvoiceGenerator from "./pages/dashboard/InvoiceGenerator";
import Register from "./pages/authentication/Register";
import Login from "./pages/authentication/Login";
import ForgotPassword from "./pages/authentication/ForgotPassword";
import VerifyOTP from "./pages/authentication/VerifyOTP";
import ResetPassword from "./pages/authentication/ResetPassword";
import Excel from "./pages/dashboard/Excel";
import InvoiceList from "./pages/dashboard/InvoiceList";
import { Toaster } from "sonner";

function App() {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  useCheckAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <>
    <Toaster position="top-right" richColors />
    <Routes>
      
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/register"
        element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />}
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected Dashboard Routes */}
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
        <Route path="invoice" element={<InvoiceGenerator />} />
        <Route path="excel" element={<Excel />} />
        <Route path="invoices" element={<InvoiceList />} />
      </Route>
    </Routes>
    </>
  );
}

export default App;