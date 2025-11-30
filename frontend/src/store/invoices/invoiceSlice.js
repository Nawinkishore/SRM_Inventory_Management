
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  invoices: [],
  loading: false,
  error: null,
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
    deleteInvoice: (state, action) => {
      state.invoices = state.invoices.filter(
        (invoice) => invoice._id !== action.payload
      );
    },
    clearInvoices: (state) => {
      state.invoices = [];
      state.currentInvoice = null;
      state.error = null;
    },
  },
});

export const { setInvoices, clearInvoices ,deleteInvoice} = invoiceSlice.actions;

export default invoiceSlice.reducer;
