import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '@/api/axios'

// Thunk for fetching products
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (search, { rejectWithValue }) => {
    try {
      const res = await api.get(`/products/getProducts`, {
        params: { search },
      });
      const data = res.data;

      if (data.success && Array.isArray(data.products)) {
        // Map API response into consistent frontend format
        return data.products.map((p) => ({
          partNo: p.partNo,
          description: p.partName,
          mrp: p.revisedMRP || 0,
          cgst: p.CGSTCode || 0,
          sgst: p.SGSTCode || 0,
        }));
      } else {
        return [];
      }
    } catch (err) {
      console.error("Fetch error:", err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearProducts: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProducts } = productSlice.actions;
export default productSlice.reducer;
