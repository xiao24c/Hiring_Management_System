// src/api/onboardingApi.js
import api from "./axiosInstance";

// 获取当前用户的 onboarding 数据
export const getMyOnboarding = () => {
  return api.get("/onboarding/me");
};

// 保存或更新草稿
export const saveOnboardingDraft = (payload) => {
  return api.post("/onboarding/me", payload);
};

// 正式提交（第一次提交和被拒后的 resubmit）
export const submitOnboarding = (payload) => {
  return api.post("/onboarding/submit", payload);
};