import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getMyOnboarding,
  saveOnboardingDraft,
  submitOnboarding,
} from "../api/onboardingApi";

/* ==========================================================
   Fetch onboarding
========================================================== */
export const fetchOnboarding = createAsyncThunk(
  "onboarding/fetch",
  async (_, thunkAPI) => {
    try {
      const res = await getMyOnboarding();
      return res.data; // <-- entire OnboardingApplication object
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.msg || "Failed to load onboarding"
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState();
      // 避免重复请求：仅在 idle 时允许触发
      return state.onboarding?.status === "idle";
    },
  }
);

/* ==========================================================
   Save draft
========================================================== */
export const saveDraftThunk = createAsyncThunk(
  "onboarding/saveDraft",
  async (payload, thunkAPI) => {
    try {
      const res = await saveOnboardingDraft(payload);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.msg || "Failed to save draft"
      );
    }
  }
);

/* ==========================================================
   Submit (final submission)
========================================================== */
export const submitThunk = createAsyncThunk(
  "onboarding/submit",
  async (payload, thunkAPI) => {
    try {
      // IMPORTANT: submit also sends payload
      const draftRes = await saveOnboardingDraft(payload);
      const submitRes = await submitOnboarding();
      return {
        ...draftRes.data,
        status: submitRes.data.status,
        submittedAt: submitRes.data.submittedAt,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.msg || "Failed to submit onboarding"
      );
    }
  }
);

/* ==========================================================
   Slice
========================================================== */
const onboardingSlice = createSlice({
  name: "onboarding",
  initialState: {
    status: "idle",
    error: null,

    onboardingStatus: null,
    data: null,
    feedback: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* ---------- fetch ---------- */
      .addCase(fetchOnboarding.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchOnboarding.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.onboardingStatus = action.payload.status; // directly from DB
        state.data = action.payload;
        state.feedback = action.payload.feedback || null;
      })
      .addCase(fetchOnboarding.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      /* ---------- save draft ---------- */
      .addCase(saveDraftThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(saveDraftThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.onboardingStatus = action.payload.status;
        state.data = action.payload;
        state.feedback = action.payload.feedback || null;
      })
      .addCase(saveDraftThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      /* ---------- submit ---------- */
      .addCase(submitThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(submitThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.onboardingStatus = action.payload.status; // now "pending"
        state.data = action.payload;
        state.feedback = null;
      })
      .addCase(submitThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default onboardingSlice.reducer;
