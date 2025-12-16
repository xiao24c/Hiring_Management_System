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
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;