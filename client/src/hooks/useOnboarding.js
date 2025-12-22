// src/hooks/useOnboarding.js
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOnboarding,
  saveDraftThunk,
  submitThunk,
} from "../store/onboardingSlice";

export default function useOnboarding() {
  const dispatch = useDispatch();
  const onboardingState = useSelector((s) => s.onboarding);

  const loadOnboarding = () => dispatch(fetchOnboarding());
  const saveOnboardingDraft = (payload) => dispatch(saveDraftThunk(payload));
  const submitOnboarding = (payload) => dispatch(submitThunk(payload));

  return {
    ...onboardingState,
    loadOnboarding,
    saveOnboardingDraft,
    submitOnboarding,
  };
}