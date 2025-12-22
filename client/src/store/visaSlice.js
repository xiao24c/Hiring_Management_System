import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosInstance";

/* =====================================================
   API Thunks
===================================================== */

/**
 * GET /api/visa/me
 * Load full visa workflow for current employee
 */
export const fetchVisaStatus = createAsyncThunk(
  "visa/fetchMyVisa",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/visa/me");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.msg || "Failed to load visa status"
      );
    }
  }
);

/**
 * Submit or resubmit a visa step
 *
 * Logic:
 * - not_submitted  → POST /visa/me/upload (current active step)
 * - rejected       → POST /visa/me/:step/resubmit
 */
export const submitVisaStep = createAsyncThunk(
  "visa/submitStep",
  async ({ stepKey, status, fileUrl }, thunkAPI) => {
    try {
      let res;

      if (!fileUrl) {
        return thunkAPI.rejectWithValue("fileUrl is required");
      }

      if (status === "rejected") {
        // rejected → explicit step resubmit
        res = await api.post(`/visa/me/${stepKey}/resubmit`, { fileUrl });
      } else {
        // not_submitted → upload for active step
        res = await api.post("/visa/me/upload", { fileUrl });
      }

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.msg || "Failed to submit visa document"
      );
    }
  }
);

/* =====================================================
   Slice
===================================================== */

const visaSlice = createSlice({
  name: "visa",
  initialState: {
    status: "idle", // idle | loading | succeeded | failed
    error: null,

    activeStep: null, // optReceipt | optEAD | i983 | i20
    steps: null, // full steps object from backend
  },
  reducers: {
    resetVisaState: (state) => {
      state.status = "idle";
      state.error = null;
      state.activeStep = null;
      state.steps = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- fetch visa ---------- */
      .addCase(fetchVisaStatus.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchVisaStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.activeStep = action.payload.activeStep;
        state.steps = action.payload.steps;
      })
      .addCase(fetchVisaStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      /* ---------- submit step ---------- */
      .addCase(submitVisaStep.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(submitVisaStep.fulfilled, (state, action) => {
        state.status = "succeeded";
        // 如果后端返回了最新 steps，直接覆盖以避免额外请求
        if (action.payload?.activeStep && action.payload?.steps) {
          state.activeStep = action.payload.activeStep;
          state.steps = action.payload.steps;
        }
      })
      .addCase(submitVisaStep.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetVisaState } = visaSlice.actions;
export default visaSlice.reducer;
