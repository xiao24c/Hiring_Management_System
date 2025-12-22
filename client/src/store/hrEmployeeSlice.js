import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosInstance";

/* =====================================================
   THUNKS
===================================================== */

export const fetchEmployees = createAsyncThunk(
  "hrEmployees/fetchEmployees",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/hr/employees");
      return res.data.employees;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.msg || "Failed to load employees"
      );
    }
  }
);

// HR 查看某个员工完整档案
export const fetchEmployeeDetail = createAsyncThunk(
  "hrEmployees/fetchEmployeeDetail",
  async (userId, thunkAPI) => {
    try {
      const res = await api.get(`/hr/employees/${userId}`);
      return res.data; // { user, onboarding }
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.msg || "Failed to load employee detail"
      );
    }
  }
);

/* =====================================================
   SLICE
===================================================== */

const hrEmployeesSlice = createSlice({
  name: "hrEmployees",
  initialState: {
    list: {
      employees: [],
      status: "idle",
      error: null,
    },
    detail: {
      employee: null,
      status: "idle",
      error: null,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* ---------- Employee List ---------- */
      .addCase(fetchEmployees.pending, (state) => {
        state.list.status = "loading";
        state.list.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.list.status = "succeeded";
        state.list.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.list.status = "failed";
        state.list.error = action.payload;
      })

      /* ---------- Employee Detail ---------- */
      .addCase(fetchEmployeeDetail.pending, (state) => {
        state.detail.status = "loading";
        state.detail.error = null;
        state.detail.employee = null;
      })
      .addCase(fetchEmployeeDetail.fulfilled, (state, action) => {
        state.detail.status = "succeeded";
        state.detail.employee = action.payload;
      })
      .addCase(fetchEmployeeDetail.rejected, (state, action) => {
        state.detail.status = "failed";
        state.detail.error = action.payload;
      });
  },
});

export default hrEmployeesSlice.reducer;
