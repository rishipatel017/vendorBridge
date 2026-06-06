import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import { Approval } from '../../types'

interface ApprovalState {
  approvals: Approval[]
  pending: Approval[]
  loading: boolean
  error: string | null
}

const initialState: ApprovalState = {
  approvals: [],
  pending: [],
  loading: false,
  error: null,
}

export const fetchApprovals = createAsyncThunk('approvals/fetchAll', async () => {
  const res = await api.get('/approval')
  return res.data
})

export const fetchPendingApprovals = createAsyncThunk('approvals/fetchPending', async () => {
  const res = await api.get('/approval/pending')
  return res.data
})

export const submitForApproval = createAsyncThunk(
  'approvals/submit',
  async (quotationId: string) => {
    const res = await api.post(`/approval/quotation/${quotationId}`)
    return res.data
  }
)

export const approveRequest = createAsyncThunk(
  'approvals/approve',
  async (id: string) => {
    const res = await api.post(`/approval/${id}/approve`)
    return res.data
  }
)

export const rejectRequest = createAsyncThunk(
  'approvals/reject',
  async ({ id, remarks }: { id: string; remarks: string }) => {
    const res = await api.post(`/approval/${id}/reject`, { remarks })
    return res.data
  }
)

const approvalSlice = createSlice({
  name: 'approvals',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovals.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchApprovals.fulfilled, (state, action) => { state.loading = false; state.approvals = action.payload })
      .addCase(fetchApprovals.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed' })

      .addCase(fetchPendingApprovals.pending, (state) => { state.loading = true })
      .addCase(fetchPendingApprovals.fulfilled, (state, action) => { state.loading = false; state.pending = action.payload })
      .addCase(fetchPendingApprovals.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed' })

      .addCase(approveRequest.fulfilled, (state, action) => {
        const idx = state.approvals.findIndex(a => a.id === action.payload.id)
        if (idx !== -1) state.approvals[idx] = action.payload
        state.pending = state.pending.filter(a => a.id !== action.payload.id)
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        const idx = state.approvals.findIndex(a => a.id === action.payload.id)
        if (idx !== -1) state.approvals[idx] = action.payload
        state.pending = state.pending.filter(a => a.id !== action.payload.id)
      })
  },
})

export const { clearError } = approvalSlice.actions
export default approvalSlice.reducer
