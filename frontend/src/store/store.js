// src/store/store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

import authReducer from "./auth/authSlice";
import purchaseReducer from "./purchases/purchaseSlice";

// GLOBAL RESET ACTION
export const RESET_STORE = "RESET_STORE";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Persist only auth state
};

const appReducer = combineReducers({
  auth: authReducer,
  purchase: purchaseReducer,
});

// 👇 reducer wrapper to wipe state on logout
const rootReducer = (state, action) => {
  if (action.type === RESET_STORE) {
    // clear redux state
    state = undefined;
  }

  return appReducer(state, action);
};

// Persist logic
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Final Store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export default store;
