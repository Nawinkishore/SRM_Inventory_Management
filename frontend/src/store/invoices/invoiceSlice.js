// ============================================
// 1. REDUX SLICE
// File: src/store/invoice/invoiceSlice.js
// ============================================

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  invoices: [],
  loading: false,
  error: null,
  currentInvoice: null,
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    setInvoices: (state, action) => {
      state.invoices = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    addInvoice: (state, action) => {
      state.invoices.unshift(action.payload);
    },
    
    updateInvoice: (state, action) => {
      const index = state.invoices.findIndex(
        (inv) => inv._id === action.payload._id
      );
      if (index !== -1) {
        state.invoices[index] = action.payload;
      }
    },
    
    deleteInvoice: (state, action) => {
      state.invoices = state.invoices.filter(
        (inv) => inv._id !== action.payload
      );
    },
    
    setCurrentInvoice: (state, action) => {
      state.currentInvoice = action.payload;
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    clearInvoices: (state) => {
      state.invoices = [];
      state.currentInvoice = null;
      state.error = null;
    },
  },
});

export const {
  setInvoices,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  setCurrentInvoice,
  setLoading,
  setError,
  clearError,
  clearInvoices,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;