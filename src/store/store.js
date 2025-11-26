import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReduce from "./authSlice"; 
import cartReduce from "./cartSlice";
import refreshReduce from "./refreshSlice";
import purchaseReduce from "./purchaseSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

const configPersist = {
  key: "root",
  storage,
  whitelist: ["auth","cart","refresh","purchases"],
};

const rootReduc = combineReducers({
  auth: authReduce,
  cart: cartReduce,
  refresh: refreshReduce,
  purchases: purchaseReduce,
});

const persistedReduc = persistReducer(configPersist, rootReduc);

export const store = configureStore({
  reducer: persistedReduc,
});

export const persistor = persistStore(store);
