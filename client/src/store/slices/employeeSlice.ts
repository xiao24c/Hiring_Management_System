import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface EmployeeState {
  profile: any | null;
  onboardingStatus: 'never_submitted' | 'pending' | 'approved' | 'rejected';
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  profile: null,
  onboardingStatus: 'never_submitted',
  loading: false,
  error: null,
};

// Async thunks
export const fetchEmployeeProfile = createAsyncThunk(
  'employee/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/employee/profile');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const submitOnboardingApplication = createAsyncThunk(
  'employee/submitOnboarding',
  async (applicationData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/employee/onboarding', applicationData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit application');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder.addCase(fetchEmployeeProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEmployeeProfile.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.profile = action.payload.profile;
      state.onboardingStatus = action.payload.onboardingStatus;
    });
    builder.addCase(fetchEmployeeProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Submit Onboarding
    builder.addCase(submitOnboardingApplication.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(submitOnboardingApplication.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.onboardingStatus = 'pending';
    });
    builder.addCase(submitOnboardingApplication.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = employeeSlice.actions;
export default employeeSlice.reducer;
