import { configureStore } from "@reduxjs/toolkit";
import interactionReducer from "./interactionSlice";
import authReducer from "./authSlice";

export const store = configureStore({
    reducer: {
        interaction: interactionReducer,
        auth: authReducer,
    },
});