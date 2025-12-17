import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginRequest, getCurrentUser } from "../api/authApi";

// 登录 Thunk
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      const res = await loginRequest(credentials);
      const { token } = res.data;

      localStorage.setItem("token", token);

      // 取当前用户信息（含 role）
      const me = await getCurrentUser();
      return { token, user: me.data };

    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.msg || "Login failed"
      );
    }
  }
);

export const restoreSession = createAsyncThunk(
  "auth/restore",
  async (_, thunkAPI) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return thunkAPI.rejectWithValue("No token");
    }
    try {
      const me = await getCurrentUser();
      return { token, user: me.data };
    } catch (err) {
      localStorage.removeItem("token");
      return thunkAPI.rejectWithValue(
        err.response?.data?.msg || "Failed to restore session"
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { auth } = getState();
      return !auth.user && !!auth.token;
    },
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- restore session ---------- */
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.loading = false;
        state.token = null;
        state.user = null;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
