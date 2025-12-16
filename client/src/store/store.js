// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import onboardingReducer from "./onboardingSlice";
import visaReducer from "./visaSlice";
import hrEmployeesReducer from "./hrEmployeeSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    onboarding: onboardingReducer,
    visa: visaReducer,
    hrEmployees: hrEmployeesReducer,
  },
});