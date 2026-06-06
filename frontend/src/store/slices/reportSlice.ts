import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import { DashboardData } from '../../types'

interface ReportState {
  dashboard: DashboardData | null
  loading: boolean
  error: string | null
}

const initialState: ReportState = {
  dashboard: null,
  loading: false,
  error: null,
}

export const fetchDashboard = createAsyncThunk('reports/dashboard', async () => {
  const res = await api.get('/reports/dashboard')
  return res.data
})

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchDashboard.fulfilled, (state, action) => { state.loading = false; state.dashboard = action.payload })
      .addCase(fetchDashboard.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed' })
  },
})

export const { clearError } = reportSlice.actions
export default reportSlice.reducer
