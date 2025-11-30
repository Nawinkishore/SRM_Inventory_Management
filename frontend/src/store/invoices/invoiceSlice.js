
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

    clearInvoices: (state) => {
      state.invoices = [];
      state.currentInvoice = null;
      state.error = null;
    },
  },
});

export const { setInvoices, clearInvoices } = invoiceSlice.actions;

export default invoiceSlice.reducer;
