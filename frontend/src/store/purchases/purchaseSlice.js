import { createSlice } from "@reduxjs/toolkit";

const purchaseSlice = createSlice({
  name: "purchase",
  initialState: {
    purchases: [],       // list page
    selectedPurchase: {}, // detail page
  },

  reducers: {
    setPurchases: (state, action) => {
      state.purchases = action.payload;
    },

    setSelectedPurchase: (state, action) => {
      state.selectedPurchase = action.payload;
    },

    updatePurchaseState: (state, action) => {
      const { id, data } = action.payload;

      // update list item
      state.purchases = state.purchases.map((p) =>
        p._id === id ? { ...p, ...data } : p
      );

      // update detail page data
      if (state.selectedPurchase?._id === id) {
        state.selectedPurchase = {
          ...state.selectedPurchase,
          ...data,
        };
      }
    },

    removePurchaseState: (state, action) => {
      const id = action.payload;
      state.purchases = state.purchases.filter((p) => p._id !== id);

      if (state.selectedPurchase?._id === id) {
        state.selectedPurchase = null;
      }
    },
  },
});

export const {
  setPurchases,
  setSelectedPurchase,
  updatePurchaseState,
  removePurchaseState,
} = purchaseSlice.actions;

export default purchaseSlice.reducer;
