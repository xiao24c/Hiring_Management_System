import api from "./axiosInstance";

export const getMyOnboarding = () => {
  return api.get("/onboarding/me");
};

export const saveOnboardingDraft = (payload) => {
  return api.post("/onboarding/me", payload);
};

export const submitOnboarding = (payload) => {
  return api.post("/onboarding/submit", payload);
};
