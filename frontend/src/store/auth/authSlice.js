import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  loading: true,
  profileLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthData: (state, action) => {
      state.user = action.payload.user;
      // If profile is provided during authentication, set it
      if (action.payload.profile) {
        state.profile = action.payload.profile;
      }
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.profileLoading = false;
      state.error = null;
    },
    setProfileLoading: (state, action) => {
      state.profileLoading = action.payload;
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
      state.profileLoading = false;
    },
    clearAuth: (state) => {
      state.user = null;
      state.profile = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.profileLoading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.profileLoading = false;
    },
  },
});

export const { 
  setAuthData, 
  setProfile, 
  setProfileLoading,
  updateProfile,
  clearAuth, 
  setLoading,
  setError 
} = authSlice.actions;

export default authSlice.reducer;