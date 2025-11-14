import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    profile1: null,
    loading: false,
    error: null,
};
const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        setProfile: (state, action) => {
            state.profile1 = action.payload;
            state.loading = false;
            state.error = null;
        },
        clearProfile: (state) => {
            state.profile1 = null;
            state.loading = false;
            state.error = null;
        }
    }
});

export const { setProfile, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;