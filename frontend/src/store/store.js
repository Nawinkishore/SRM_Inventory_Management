import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import purchaseReducer from "./purchases/purchaseSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  purchases: purchaseReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;
